import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/api/auth-guard';
import { getDb } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { validateBody } from '@/lib/api/validate';

const scheduleSchema = z.object({
  scheduledAt: z.string().datetime(),
});

// Schedule a post for later publishing
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const validation = await validateBody(request, scheduleSchema);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { scheduledAt } = validation.data;
    const db = getDb();

    const post = await db.select().from(posts).where(and(eq(posts.id, id), eq(posts.userId, userId))).limit(1);
    if (post.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const targetPlatforms = JSON.parse(post[0].targetPlatforms);
    if (targetPlatforms.length === 0) {
      return NextResponse.json({ error: 'No target platforms selected' }, { status: 400 });
    }

    await db
      .update(posts)
      .set({
        status: 'scheduled',
        scheduledAt,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(posts.id, id));

    return NextResponse.json({ success: true, scheduledAt });
  } catch (error) {
    console.error('POST /api/posts/[id]/schedule error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
