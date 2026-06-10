import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/api/auth-guard';
import { getDb } from '@/lib/db';
import { posts, socialAccounts, analyticsDaily, analyticsPosts, aiGenerations } from '@/lib/db/schema';
import { eq, count, sum, sql } from 'drizzle-orm';

// Analytics overview dashboard data
export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();

    // Total posts
    const totalPosts = await db.select({ count: count() }).from(posts).where(eq(posts.userId, userId));

    // Posts by status
    const allPosts = await db.select({ status: posts.status }).from(posts).where(eq(posts.userId, userId));
    const postsByStatus = { draft: 0, scheduled: 0, published: 0, failed: 0 };
    for (const p of allPosts) {
      if (p.status in postsByStatus) postsByStatus[p.status as keyof typeof postsByStatus]++;
    }

    // Connected accounts
    const accounts = await db.select().from(socialAccounts).where(eq(socialAccounts.userId, userId));

    // AI usage this month
    const aiUsage = await db.select({
      count: count(),
      totalTokens: sum(aiGenerations.tokensUsed),
    }).from(aiGenerations).where(eq(aiGenerations.userId, userId));

    // Aggregate post analytics
    const postIds = allPosts.map((_, i) => i); // We need actual post IDs
    const userPosts = await db.select({ id: posts.id }).from(posts).where(eq(posts.userId, userId));
    const postIdList = userPosts.map(p => p.id);

    let totalLikes = 0, totalComments = 0, totalShares = 0, totalImpressions = 0, totalClicks = 0;

    for (const postId of postIdList) {
      const postAnalytics = await db.select().from(analyticsPosts).where(eq(analyticsPosts.postId, postId));
      for (const a of postAnalytics) {
        totalLikes += a.likes;
        totalComments += a.comments;
        totalShares += a.shares;
        totalImpressions += a.impressions;
        totalClicks += a.clicks;
      }
    }

    // Account follower totals
    let totalFollowers = 0;
    for (const account of accounts) {
      const latestAnalytics = await db.select().from(analyticsDaily)
        .where(eq(analyticsDaily.socialAccountId, account.id))
        .orderBy(sql`${analyticsDaily.date} DESC`)
        .limit(1);
      if (latestAnalytics.length > 0) {
        totalFollowers += latestAnalytics[0].followers;
      }
    }

    return NextResponse.json({
      overview: {
        totalPosts: totalPosts[0].count,
        postsByStatus,
        connectedAccounts: accounts.length,
        totalFollowers,
        aiGenerationsUsed: aiUsage[0].count,
        aiTokensUsed: aiUsage[0].totalTokens || 0,
      },
      engagement: {
        totalLikes,
        totalComments,
        totalShares,
        totalImpressions,
        totalClicks,
        engagementRate: totalImpressions > 0
          ? ((totalLikes + totalComments + totalShares) / totalImpressions * 100).toFixed(2)
          : '0',
      },
      accounts: accounts.map(a => ({
        id: a.id,
        platform: a.platform,
        username: a.username,
        status: a.status,
      })),
    });
  } catch (error) {
    console.error('GET /api/analytics/overview error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
