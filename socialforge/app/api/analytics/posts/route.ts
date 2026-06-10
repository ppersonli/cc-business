import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/api/auth-guard';
import { getDb } from '@/lib/db';
import { posts, analyticsPosts } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// Get analytics for all posts
export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const userPosts = await db.select().from(posts).where(eq(posts.userId, userId)).orderBy(desc(posts.createdAt));

    const postsWithAnalytics = [];
    for (const post of userPosts) {
      const analytics = await db.select().from(analyticsPosts).where(eq(analyticsPosts.postId, post.id));
      const totals = analytics.reduce(
        (acc, a) => ({
          likes: acc.likes + a.likes,
          comments: acc.comments + a.comments,
          shares: acc.shares + a.shares,
          impressions: acc.impressions + a.impressions,
          clicks: acc.clicks + a.clicks,
        }),
        { likes: 0, comments: 0, shares: 0, impressions: 0, clicks: 0 }
      );

      postsWithAnalytics.push({
        id: post.id,
        content: post.content.slice(0, 100),
        status: post.status,
        publishedAt: post.publishedAt,
        targetPlatforms: JSON.parse(post.targetPlatforms),
        analytics: totals,
        byPlatform: analytics.map(a => ({
          platform: a.platform,
          likes: a.likes,
          comments: a.comments,
          shares: a.shares,
          impressions: a.impressions,
          clicks: a.clicks,
        })),
      });
    }

    return NextResponse.json({ posts: postsWithAnalytics });
  } catch (error) {
    console.error('GET /api/analytics/posts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
