/**
 * Publishing engine for SocialForge.
 * Handles publishing posts to social media platforms.
 */

import { getDb } from '@/lib/db';
import { posts, postLogs, socialAccounts } from '@/lib/db/schema';
import { eq, and, lte } from 'drizzle-orm';
import { getAccountToken } from '@/lib/oauth/token-manager';
import { nowISO } from '@/lib/utils/format';

export interface PublishResult {
  success: boolean;
  platformPostId?: string;
  error?: string;
}

/**
 * Publish a post to a single platform.
 */
export async function publishToPlatform(
  postId: string,
  platform: string,
  content: string,
  accessToken: string
): Promise<PublishResult> {
  try {
    if (platform === 'twitter') {
      return await publishToTwitter(content, accessToken);
    }
    if (platform === 'linkedin') {
      return await publishToLinkedIn(content, accessToken);
    }
    return { success: false, error: `Unsupported platform: ${platform}` };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function publishToTwitter(content: string, accessToken: string): Promise<PublishResult> {
  const response = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: content }),
  });

  if (!response.ok) {
    const error = await response.text();
    return { success: false, error: `Twitter API error (${response.status}): ${error}` };
  }

  const data = await response.json();
  return { success: true, platformPostId: data.data?.id };
}

async function publishToLinkedIn(content: string, accessToken: string): Promise<PublishResult> {
  // First get the user's profile URN
  const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!profileRes.ok) {
    return { success: false, error: 'Failed to fetch LinkedIn profile' };
  }

  const profile = await profileRes.json();
  const authorUrn = `urn:li:person:${profile.sub}`;

  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: content },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return { success: false, error: `LinkedIn API error (${response.status}): ${error}` };
  }

  const data = await response.json();
  return { success: true, platformPostId: data.id };
}

/**
 * Execute publishing of a post to all target platforms.
 */
export async function executePostPublish(postId: string): Promise<{
  totalPlatforms: number;
  succeeded: number;
  failed: number;
}> {
  const db = getDb();

  // Get the post
  const postResult = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
  if (postResult.length === 0) throw new Error('Post not found');
  const post = postResult[0];

  const targetPlatforms: string[] = JSON.parse(post.targetPlatforms);
  let succeeded = 0;
  let failed = 0;

  for (const platform of targetPlatforms) {
    // Find active account for this platform
    const accountResult = await db
      .select()
      .from(socialAccounts)
      .where(
        and(
          eq(socialAccounts.userId, post.userId),
          eq(socialAccounts.platform, platform),
          eq(socialAccounts.status, 'active')
        )
      )
      .limit(1);

    if (accountResult.length === 0) {
      // Log: no account connected
      await db.insert(postLogs).values({
        id: crypto.randomUUID(),
        postId,
        platform,
        status: 'failed',
        errorMessage: `No active ${platform} account connected`,
        createdAt: nowISO(),
      });
      failed++;
      continue;
    }

    const account = accountResult[0];
    const accessToken = await getAccountToken(account.id);

    if (!accessToken) {
      await db.insert(postLogs).values({
        id: crypto.randomUUID(),
        postId,
        platform,
        status: 'failed',
        errorMessage: 'Failed to decrypt access token',
        createdAt: nowISO(),
      });
      failed++;
      continue;
    }

    const result = await publishToPlatform(postId, platform, post.content, accessToken);

    await db.insert(postLogs).values({
      id: crypto.randomUUID(),
      postId,
      platform,
      status: result.success ? 'success' : 'failed',
      platformPostId: result.platformPostId || null,
      errorMessage: result.error || null,
      publishedAt: result.success ? nowISO() : null,
      createdAt: nowISO(),
    });

    if (result.success) succeeded++;
    else failed++;
  }

  // Update post status
  const newStatus = failed === 0 ? 'published' : succeeded === 0 ? 'failed' : 'published';
  await db
    .update(posts)
    .set({
      status: newStatus,
      publishedAt: nowISO(),
      updatedAt: nowISO(),
    })
    .where(eq(posts.id, postId));

  return { totalPlatforms: targetPlatforms.length, succeeded, failed };
}

/**
 * Find all scheduled posts that are due for publishing.
 */
export async function findDueScheduledPosts(): Promise<string[]> {
  const db = getDb();
  const now = nowISO();

  const duePosts = await db
    .select({ id: posts.id })
    .from(posts)
    .where(
      and(
        eq(posts.status, 'scheduled'),
        lte(posts.scheduledAt, now)
      )
    );

  return duePosts.map((p) => p.id);
}
