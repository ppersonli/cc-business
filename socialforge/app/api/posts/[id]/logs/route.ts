import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/api/auth-guard';
import { getDb } from '@/lib/db';
import { posts, postLogs } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// Get publish logs for a post
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const db = getDb();

    // Verify ownership
    const post = await db.select().from(posts).where(and(eq(posts.id, id), eq(posts.userId, userId))).limit(1);
    if (post.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const logs = await db.select().from(postLogs).where(eq(postLogs.postId, id)).orderBy(desc(postLogs.createdAt));

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('GET /api/posts/[id]/logs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
