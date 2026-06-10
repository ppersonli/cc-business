import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/api/auth-guard';
import { generateContent } from '@/lib/ai/gemini';
import { z } from 'zod';
import { validateBody } from '@/lib/api/validate';

const generateSchema = z.object({
  topic: z.string().min(1),
  platform: z.string().optional(),
  tone: z.string().optional(),
  includeHashtags: z.boolean().optional(),
  includeEmojis: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const validation = await validateBody(request, generateSchema);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const result = await generateContent(userId, { ...validation.data, platform: validation.data.platform || 'twitter' });
    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/ai/generate error:', error);
    return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
  }
}
