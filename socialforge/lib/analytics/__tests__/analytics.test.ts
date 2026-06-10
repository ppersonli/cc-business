import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../../db/schema';
import { eq } from 'drizzle-orm';
import { generateId } from '../../utils/uuid';

let db: ReturnType<typeof drizzle<typeof schema>>;
let client: ReturnType<typeof createClient>;
let userId: string;

beforeEach(async () => {
  client = createClient({ url: ':memory:' });
  db = drizzle(client, { schema });

  await client.execute(`CREATE TABLE users (id TEXT PRIMARY KEY NOT NULL, email TEXT NOT NULL UNIQUE, name TEXT, clerk_id TEXT NOT NULL UNIQUE, image_url TEXT, subscription_tier TEXT NOT NULL DEFAULT 'free', created_at TEXT NOT NULL)`);
  await client.execute(`CREATE TABLE social_accounts (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, platform TEXT NOT NULL, access_token TEXT NOT NULL, refresh_token TEXT, username TEXT NOT NULL, platform_user_id TEXT, status TEXT NOT NULL DEFAULT 'active', expires_at TEXT, created_at TEXT NOT NULL)`);
  await client.execute(`CREATE TABLE analytics_daily (id TEXT PRIMARY KEY NOT NULL, social_account_id TEXT NOT NULL, date TEXT NOT NULL, followers INTEGER NOT NULL DEFAULT 0, engagement_rate REAL NOT NULL DEFAULT 0, impressions INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL)`);
  await client.execute(`CREATE TABLE analytics_posts (id TEXT PRIMARY KEY NOT NULL, post_id TEXT NOT NULL, platform TEXT NOT NULL, likes INTEGER NOT NULL DEFAULT 0, comments INTEGER NOT NULL DEFAULT 0, shares INTEGER NOT NULL DEFAULT 0, impressions INTEGER NOT NULL DEFAULT 0, clicks INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL)`);
  await client.execute(`CREATE TABLE posts (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, content TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft', scheduled_at TEXT, published_at TEXT, target_platforms TEXT NOT NULL DEFAULT '[]', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`);
  await client.execute(`CREATE TABLE ai_generations (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, prompt TEXT NOT NULL, result TEXT NOT NULL, model TEXT NOT NULL, tokens_used INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL)`);

  userId = generateId();
  await client.execute({
    sql: 'INSERT INTO users (id, email, clerk_id, created_at) VALUES (?, ?, ?, ?)',
    args: [userId, 'test@example.com', 'clerk_test', new Date().toISOString()],
  });
});

afterEach(() => { client.close(); });

describe('Analytics daily data', () => {
  it('stores and retrieves daily analytics', async () => {
    const accountId = generateId();
    const now = new Date().toISOString();

    await client.execute({
      sql: 'INSERT INTO social_accounts (id, user_id, platform, access_token, username, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [accountId, userId, 'twitter', 'token', '@test', now],
    });

    await client.execute({
      sql: 'INSERT INTO analytics_daily (id, social_account_id, date, followers, engagement_rate, impressions, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [generateId(), accountId, '2026-06-10', 1500, 3.5, 25000, now],
    });

    const result = await client.execute({
      sql: 'SELECT * FROM analytics_daily WHERE social_account_id = ?',
      args: [accountId],
    });
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].followers).toBe(1500);
    expect(result.rows[0].engagement_rate).toBe(3.5);
  });

  it('queries analytics for a date range', async () => {
    const accountId = generateId();
    const now = new Date().toISOString();

    await client.execute({
      sql: 'INSERT INTO social_accounts (id, user_id, platform, access_token, username, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [accountId, userId, 'twitter', 'token', '@test', now],
    });

    for (let i = 0; i < 7; i++) {
      const date = `2026-06-${String(i + 1).padStart(2, '0')}`;
      await client.execute({
        sql: 'INSERT INTO analytics_daily (id, social_account_id, date, followers, engagement_rate, impressions, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        args: [generateId(), accountId, date, 1000 + i * 100, 2.0 + i * 0.5, 10000 + i * 1000, now],
      });
    }

    const result = await client.execute({
      sql: "SELECT * FROM analytics_daily WHERE social_account_id = ? AND date >= '2026-06-03' AND date <= '2026-06-05' ORDER BY date",
      args: [accountId],
    });
    expect(result.rows).toHaveLength(3);
    expect(result.rows[0].date).toBe('2026-06-03');
  });
});

describe('Analytics post data', () => {
  it('stores post analytics', async () => {
    const postId = generateId();
    const now = new Date().toISOString();

    await client.execute({
      sql: 'INSERT INTO posts (id, user_id, content, target_platforms, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [postId, userId, 'Test post', '["twitter"]', now, now],
    });

    await client.execute({
      sql: 'INSERT INTO analytics_posts (id, post_id, platform, likes, comments, shares, impressions, clicks, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [generateId(), postId, 'twitter', 42, 7, 15, 5000, 120, now],
    });

    const result = await client.execute({
      sql: 'SELECT * FROM analytics_posts WHERE post_id = ?',
      args: [postId],
    });
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].likes).toBe(42);
    expect(result.rows[0].impressions).toBe(5000);
  });

  it('aggregates post analytics across platforms', async () => {
    const postId = generateId();
    const now = new Date().toISOString();

    await client.execute({
      sql: 'INSERT INTO posts (id, user_id, content, target_platforms, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [postId, userId, 'Multi-platform post', '["twitter","linkedin"]', now, now],
    });

    await client.execute({
      sql: 'INSERT INTO analytics_posts (id, post_id, platform, likes, comments, shares, impressions, clicks, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [generateId(), postId, 'twitter', 42, 7, 15, 5000, 120, now],
    });
    await client.execute({
      sql: 'INSERT INTO analytics_posts (id, post_id, platform, likes, comments, shares, impressions, clicks, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [generateId(), postId, 'linkedin', 85, 23, 8, 12000, 340, now],
    });

    const result = await client.execute({
      sql: 'SELECT SUM(likes) as total_likes, SUM(impressions) as total_impressions FROM analytics_posts WHERE post_id = ?',
      args: [postId],
    });
    expect(result.rows[0].total_likes).toBe(127);
    expect(result.rows[0].total_impressions).toBe(17000);
  });
});

describe('AI generations', () => {
  it('stores an AI generation record', async () => {
    const now = new Date().toISOString();
    await client.execute({
      sql: 'INSERT INTO ai_generations (id, user_id, prompt, result, model, tokens_used, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [generateId(), userId, 'Write a tweet about AI', 'AI is transforming everything!', 'gemini-pro', 150, now],
    });

    const result = await client.execute({
      sql: 'SELECT * FROM ai_generations WHERE user_id = ?',
      args: [userId],
    });
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].model).toBe('gemini-pro');
    expect(result.rows[0].tokens_used).toBe(150);
  });

  it('counts AI usage per user', async () => {
    const now = new Date().toISOString();
    for (let i = 0; i < 5; i++) {
      await client.execute({
        sql: 'INSERT INTO ai_generations (id, user_id, prompt, result, model, tokens_used, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        args: [generateId(), userId, `Prompt ${i}`, `Result ${i}`, 'gemini-pro', 100, now],
      });
    }

    const result = await client.execute({
      sql: 'SELECT COUNT(*) as count, SUM(tokens_used) as total_tokens FROM ai_generations WHERE user_id = ?',
      args: [userId],
    });
    expect(result.rows[0].count).toBe(5);
    expect(result.rows[0].total_tokens).toBe(500);
  });
});
