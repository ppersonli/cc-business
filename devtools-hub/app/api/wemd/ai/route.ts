import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { initSchema, findUserById, getSubscriptionByUserId } from '@/lib/db';
import { AI_PROMPTS, buildUserMessage, type AIAction } from '@/lib/wemd/ai/prompts';

// Rate limit: in-memory map (per-instance, resets on deploy)
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const FREE_DAILY_LIMIT = 3;
const PRO_DAILY_LIMIT = 50;

function getRateLimit(userId: string, isPro: boolean): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const limit = isPro ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;
  const key = `${userId}-${new Date().toISOString().slice(0, 10)}`;

  let entry = rateLimits.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + 24 * 60 * 60 * 1000 };
    rateLimits.set(key, entry);
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count };
}

async function getUserFromRequest(req: NextRequest): Promise<{ userId: number; isPro: boolean } | null> {
  let userId: number | null = null;

  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const payload = verifyToken(authHeader.slice(7));
    if (payload) userId = payload.userId;
  }
  if (!userId) {
    const cookie = req.cookies.get('auth_token');
    if (cookie?.value) {
      const payload = verifyToken(cookie.value);
      if (payload) userId = payload.userId;
    }
  }
  if (!userId) return null;

  await initSchema();
  const sub = await getSubscriptionByUserId(userId);
  const isPro = sub?.status === 'active' && sub.plan?.startsWith('wemd-pro');

  return { userId, isPro };
}

/**
 * POST /api/wemd/ai
 * Body: { action: AIAction, content: string, context?: string }
 * Returns SSE stream with AI-generated text.
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Login required to use AI features' }, { status: 401 });
    }

    const { action, content, context } = await request.json();

    // Validate action
    const validActions: AIAction[] = ['polish', 'expand', 'shorten', 'translate', 'continue'];
    if (!action || !validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Rate limit
    const { allowed, remaining } = getRateLimit(String(user.userId), user.isPro);
    if (!allowed) {
      return NextResponse.json(
        { error: user.isPro ? 'Daily AI limit reached (50/day). Resets tomorrow.' : 'Free AI trial used up (3/day). Upgrade to Pro for 50/day.' },
        { status: 429 }
      );
    }

    // MiMo API config
    const apiKey = process.env.MIMO_API_KEY;
    const baseUrl = process.env.MIMO_BASE_URL || 'https://api.xiaomimimo.com/v1';
    const model = process.env.MIMO_MODEL || 'mimo-v2-flash';

    if (!apiKey || apiKey === 'your-mimo-api-key-here') {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
    }

    const promptConfig = AI_PROMPTS[action as AIAction];
    const userMessage = buildUserMessage(action, content, context);

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-key': apiKey,
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: promptConfig.system },
                { role: 'user', content: userMessage },
              ],
              temperature: promptConfig.temperature,
              max_tokens: promptConfig.maxTokens,
              stream: true,
              thinking: { type: 'disabled' },
            }),
          });

          if (!response.ok) {
            const errText = await response.text();
            console.error('[WeMD AI] MiMo API error:', response.status, errText);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'AI service error' })}\n\n`));
            controller.close();
            return;
          }

          const reader = response.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }

          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;

              const data = trimmed.slice(6);
              if (data === '[DONE]') {
                controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                controller.close();
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: delta, remaining })}\n\n`));
                }
              } catch {
                // Skip malformed SSE lines
              }
            }
          }

          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (err) {
          console.error('[WeMD AI] Stream error:', err);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-AI-Remaining': String(remaining),
      },
    });
  } catch (error) {
    console.error('[WeMD AI] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
