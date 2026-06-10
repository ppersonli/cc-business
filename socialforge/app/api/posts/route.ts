import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/api/auth-guard';
import { getDb } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import { validateBody } from '@/lib/api/validate';

const createPostSchema = z.object({
  content: z.string().min(1),
  targetPlatforms: z.array(z.string()).default([]),
  status: z.enum(['draft', 'scheduled']).default('draft'),
  scheduledAt: z.string().optional(),
});

// List posts for the authenticated user
export async function GET(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const db = getDb();
    let query = db.select().from(posts).where(eq(posts.userId, userId));

    const allPosts = await query.orderBy(desc(posts.createdAt)).limit(limit).offset(offset);
    const total = await db.select({ count: posts.id }).from(posts).where(eq(posts.userId, userId));

    return NextResponse.json({
      posts: allPosts.map(p => ({
        ...p,
        targetPlatforms: JSON.parse(p.targetPlatforms),
      })),
      total: total.length,
    });
  } catch (error) {
    console.error('GET /api/posts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create a new post
export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const validation = await validateBody(request, createPostSchema);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { content, targetPlatforms, status, scheduledAt } = validation.data;
    const db = getDb();
    const now = new Date().toISOString();

    const newPost = {
      id: crypto.randomUUID(),
      userId,
      content,
      status: status || 'draft',
      scheduledAt: scheduledAt || null,
      publishedAt: null,
      targetPlatforms: JSON.stringify(targetPlatforms),
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(posts).values(newPost);

    return NextResponse.json({
      post: { ...newPost, targetPlatforms },
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/posts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
