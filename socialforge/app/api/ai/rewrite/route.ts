import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/api/auth-guard';
import { rewriteContent } from '@/lib/ai/gemini';
import { z } from 'zod';
import { validateBody } from '@/lib/api/validate';

const rewriteSchema = z.object({
  content: z.string().min(1),
  style: z.string().optional(),
  platform: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const validation = await validateBody(request, rewriteSchema);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const result = await rewriteContent(userId, validation.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/ai/rewrite error:', error);
    return NextResponse.json({ error: 'AI rewrite failed' }, { status: 500 });
  }
}
