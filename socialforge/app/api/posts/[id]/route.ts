import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/api/auth-guard';
import { getDb } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// Get a single post
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const db = getDb();
    const result = await db.select().from(posts).where(and(eq(posts.id, id), eq(posts.userId, userId))).limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = result[0];
    return NextResponse.json({ post: { ...post, targetPlatforms: JSON.parse(post.targetPlatforms) } });
  } catch (error) {
    console.error('GET /api/posts/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update a post
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { content, targetPlatforms, status, scheduledAt } = body;

    const db = getDb();
    const existing = await db.select().from(posts).where(and(eq(posts.id, id), eq(posts.userId, userId))).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (content !== undefined) updates.content = content;
    if (targetPlatforms !== undefined) updates.targetPlatforms = JSON.stringify(targetPlatforms);
    if (status !== undefined) updates.status = status;
    if (scheduledAt !== undefined) updates.scheduledAt = scheduledAt;

    await db.update(posts).set(updates).where(eq(posts.id, id));

    const updated = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    const post = updated[0];

    return NextResponse.json({ post: { ...post, targetPlatforms: JSON.parse(post.targetPlatforms) } });
  } catch (error) {
    console.error('PUT /api/posts/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete a post
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const db = getDb();
    await db.delete(posts).where(and(eq(posts.id, id), eq(posts.userId, userId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/posts/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
