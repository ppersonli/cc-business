import { inngest } from './client';
import { executePostPublish, findDueScheduledPosts } from '@/lib/publishing/engine';
import { getDb } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nowISO } from '@/lib/utils/format';

/**
 * Scheduled function: checks for due posts every minute.
 */
export const checkScheduledPosts = inngest.createFunction(
  {
    id: 'check-scheduled-posts',
    name: 'Check Scheduled Posts',
    triggers: [{ cron: '* * * * *' }],
  },
  async ({ step }) => {
    const duePostIds = await step.run('find-due-posts', async () => {
      return findDueScheduledPosts();
    });

    for (const postId of duePostIds) {
      await step.sendEvent('publish-post', {
        name: 'posts.publish',
        data: { postId },
      });
    }

    return { processed: duePostIds.length };
  }
);

/**
 * Event-driven function: publishes a single post.
 */
export const publishPost = inngest.createFunction(
  {
    id: 'publish-post',
    name: 'Publish Post',
    triggers: [{ event: 'posts.publish' }],
  },
  async ({ event, step }) => {
    const { postId } = event.data;

    const result = await step.run('execute-publish', async () => {
      return executePostPublish(postId);
    });

    return result;
  }
);

/**
 * Event-driven function: retries a failed publish (max 3 attempts).
 */
export const retryPublish = inngest.createFunction(
  {
    id: 'retry-publish',
    name: 'Retry Failed Publish',
    triggers: [{ event: 'posts.retry' }],
  },
  async ({ event, step }) => {
    const { postId, attempt = 1 } = event.data;

    if (attempt > 3) {
      const db = getDb();
      await db.update(posts).set({ status: 'failed', updatedAt: nowISO() }).where(eq(posts.id, postId));
      return { success: false, reason: 'Max retries exceeded' };
    }

    const delays = [60000, 300000, 900000];
    await step.sleep(`wait-before-retry-${attempt}`, delays[attempt - 1]);

    const result = await step.run('execute-retry', async () => {
      return executePostPublish(postId);
    });

    if (result.failed > 0 && result.succeeded === 0) {
      await step.sendEvent('retry-again', {
        name: 'posts.retry',
        data: { postId, attempt: attempt + 1 },
      });
    }

    return result;
  }
);

export const functions = [checkScheduledPosts, publishPost, retryPublish];
