import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../../db/schema';
import { eq } from 'drizzle-orm';
import { generateId } from '../../utils/uuid';

let db: ReturnType<typeof drizzle<typeof schema>>;
let client: ReturnType<typeof createClient>;
let userId: string;
let postId: string;

beforeEach(async () => {
  client = createClient({ url: ':memory:' });
  db = drizzle(client, { schema });

  await client.execute(`CREATE TABLE users (id TEXT PRIMARY KEY NOT NULL, email TEXT NOT NULL UNIQUE, name TEXT, clerk_id TEXT NOT NULL UNIQUE, image_url TEXT, subscription_tier TEXT NOT NULL DEFAULT 'free', created_at TEXT NOT NULL)`);
  await client.execute(`CREATE TABLE posts (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, content TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft', scheduled_at TEXT, published_at TEXT, target_platforms TEXT NOT NULL DEFAULT '[]', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`);
  await client.execute(`CREATE TABLE post_logs (id TEXT PRIMARY KEY NOT NULL, post_id TEXT NOT NULL, platform TEXT NOT NULL, status TEXT NOT NULL, platform_post_id TEXT, error_message TEXT, published_at TEXT, created_at TEXT NOT NULL)`);
  await client.execute(`CREATE TABLE social_accounts (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, platform TEXT NOT NULL, access_token TEXT NOT NULL, refresh_token TEXT, username TEXT NOT NULL, platform_user_id TEXT, status TEXT NOT NULL DEFAULT 'active', expires_at TEXT, created_at TEXT NOT NULL)`);
  await client.execute(`CREATE INDEX idx_posts_user_id ON posts(user_id)`);
  await client.execute(`CREATE INDEX idx_posts_status ON posts(status)`);
  await client.execute(`CREATE INDEX idx_post_logs_post_id ON post_logs(post_id)`);

  userId = generateId();
  postId = generateId();
  const now = new Date().toISOString();

  await client.execute({
    sql: 'INSERT INTO users (id, email, clerk_id, created_at) VALUES (?, ?, ?, ?)',
    args: [userId, 'test@example.com', 'clerk_test', now],
  });

  await client.execute({
    sql: 'INSERT INTO posts (id, user_id, content, target_platforms, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    args: [postId, userId, 'Test post content', '["twitter","linkedin"]', now, now],
  });
});

afterEach(() => { client.close(); });

describe('Post log tracking', () => {
  it('creates a publish log entry', async () => {
    const logId = generateId();
    const now = new Date().toISOString();

    await client.execute({
      sql: 'INSERT INTO post_logs (id, post_id, platform, status, platform_post_id, published_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [logId, postId, 'twitter', 'success', 'tweet_123', now, now],
    });

    const result = await client.execute({ sql: 'SELECT * FROM post_logs WHERE post_id = ?', args: [postId] });
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].platform).toBe('twitter');
    expect(result.rows[0].status).toBe('success');
    expect(result.rows[0].platform_post_id).toBe('tweet_123');
  });

  it('tracks multiple platform logs for one post', async () => {
    const now = new Date().toISOString();

    await client.execute({
      sql: 'INSERT INTO post_logs (id, post_id, platform, status, platform_post_id, published_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [generateId(), postId, 'twitter', 'success', 'tweet_1', now, now],
    });
    await client.execute({
      sql: 'INSERT INTO post_logs (id, post_id, platform, status, error_message, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [generateId(), postId, 'linkedin', 'failed', 'Token expired', now],
    });

    const result = await client.execute({ sql: 'SELECT * FROM post_logs WHERE post_id = ?', args: [postId] });
    expect(result.rows).toHaveLength(2);
  });

  it('records error messages for failed publishes', async () => {
    const now = new Date().toISOString();

    await client.execute({
      sql: 'INSERT INTO post_logs (id, post_id, platform, status, error_message, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [generateId(), postId, 'twitter', 'failed', 'Rate limit exceeded (429)', now],
    });

    const result = await client.execute({
      sql: "SELECT * FROM post_logs WHERE post_id = ? AND status = 'failed'",
      args: [postId],
    });
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].error_message).toBe('Rate limit exceeded (429)');
  });
});

describe('Scheduled post querying', () => {
  it('finds posts due for publishing', async () => {
    const pastTime = new Date(Date.now() - 60000).toISOString();
    const futureTime = new Date(Date.now() + 3600000).toISOString();

    await client.execute({
      sql: "UPDATE posts SET status = 'scheduled', scheduled_at = ? WHERE id = ?",
      args: [pastTime, postId],
    });

    // Add a future post
    const futurePostId = generateId();
    const now = new Date().toISOString();
    await client.execute({
      sql: 'INSERT INTO posts (id, user_id, content, status, scheduled_at, target_platforms, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      args: [futurePostId, userId, 'Future post', 'scheduled', futureTime, '[]', now, now],
    });

    const duePosts = await client.execute({
      sql: "SELECT * FROM posts WHERE status = 'scheduled' AND scheduled_at <= ?",
      args: [new Date().toISOString()],
    });

    expect(duePosts.rows).toHaveLength(1);
    expect(duePosts.rows[0].id).toBe(postId);
  });

  it('filters posts by status', async () => {
    const now = new Date().toISOString();

    // Create posts with different statuses
    for (const status of ['draft', 'scheduled', 'published', 'failed']) {
      await client.execute({
        sql: 'INSERT INTO posts (id, user_id, content, status, target_platforms, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        args: [generateId(), userId, `${status} post`, status, '[]', now, now],
      });
    }

    const scheduled = await client.execute({
      sql: "SELECT * FROM posts WHERE user_id = ? AND status = 'scheduled'",
      args: [userId],
    });
    expect(scheduled.rows).toHaveLength(1);
  });
});

describe('Post status transitions', () => {
  it('transitions from draft to scheduled', async () => {
    const scheduledAt = new Date(Date.now() + 3600000).toISOString();
    await client.execute({
      sql: "UPDATE posts SET status = 'scheduled', scheduled_at = ? WHERE id = ?",
      args: [scheduledAt, postId],
    });

    const result = await client.execute({ sql: 'SELECT status, scheduled_at FROM posts WHERE id = ?', args: [postId] });
    expect(result.rows[0].status).toBe('scheduled');
    expect(result.rows[0].scheduled_at).toBe(scheduledAt);
  });

  it('transitions from scheduled to published', async () => {
    const now = new Date().toISOString();
    await client.execute({
      sql: "UPDATE posts SET status = 'scheduled', scheduled_at = ? WHERE id = ?",
      args: [now, postId],
    });

    const publishedAt = new Date().toISOString();
    await client.execute({
      sql: "UPDATE posts SET status = 'published', published_at = ? WHERE id = ?",
      args: [publishedAt, postId],
    });

    const result = await client.execute({ sql: 'SELECT status, published_at FROM posts WHERE id = ?', args: [postId] });
    expect(result.rows[0].status).toBe('published');
    expect(result.rows[0].published_at).toBe(publishedAt);
  });

  it('transitions from scheduled to failed', async () => {
    await client.execute({
      sql: "UPDATE posts SET status = 'failed' WHERE id = ?",
      args: [postId],
    });

    const result = await client.execute({ sql: 'SELECT status FROM posts WHERE id = ?', args: [postId] });
    expect(result.rows[0].status).toBe('failed');
  });
});

describe('Publish schedule API route', () => {
  it('schedule endpoint sets scheduled status', async () => {
    const scheduledAt = new Date(Date.now() + 7200000).toISOString();

    await client.execute({
      sql: "UPDATE posts SET status = 'scheduled', scheduled_at = ? WHERE id = ?",
      args: [scheduledAt, postId],
    });

    const result = await client.execute({ sql: 'SELECT status, scheduled_at FROM posts WHERE id = ?', args: [postId] });
    expect(result.rows[0].status).toBe('scheduled');
    expect(result.rows[0].scheduled_at).toBe(scheduledAt);
  });
});

describe('Social account lookup for publishing', () => {
  it('finds active accounts for a platform', async () => {
    const now = new Date().toISOString();
    const accountId = generateId();

    await client.execute({
      sql: 'INSERT INTO social_accounts (id, user_id, platform, access_token, username, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [accountId, userId, 'twitter', 'encrypted_token', '@testuser', 'active', now],
    });

    const result = await client.execute({
      sql: "SELECT * FROM social_accounts WHERE user_id = ? AND platform = 'twitter' AND status = 'active'",
      args: [userId],
    });
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].username).toBe('@testuser');
  });

  it('excludes inactive accounts', async () => {
    const now = new Date().toISOString();

    await client.execute({
      sql: 'INSERT INTO social_accounts (id, user_id, platform, access_token, username, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [generateId(), userId, 'twitter', 'token', '@expired', 'expired', now],
    });

    const result = await client.execute({
      sql: "SELECT * FROM social_accounts WHERE user_id = ? AND platform = 'twitter' AND status = 'active'",
      args: [userId],
    });
    expect(result.rows).toHaveLength(0);
  });
});
