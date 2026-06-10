import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../schema';
import { eq } from 'drizzle-orm';

let db: ReturnType<typeof drizzle<typeof schema>>;
let client: ReturnType<typeof createClient>;

beforeEach(async () => {
  client = createClient({ url: ':memory:' });
  db = drizzle(client, { schema });

  // Create all tables
  await client.execute(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      clerk_id TEXT NOT NULL UNIQUE,
      image_url TEXT,
      subscription_tier TEXT NOT NULL DEFAULT 'free',
      created_at TEXT NOT NULL
    )
  `);
  await client.execute(`CREATE INDEX idx_users_clerk_id ON users(clerk_id)`);

  await client.execute(`
    CREATE TABLE social_accounts (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      platform TEXT NOT NULL,
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      username TEXT NOT NULL,
      platform_user_id TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      expires_at TEXT,
      created_at TEXT NOT NULL
    )
  `);
  await client.execute(`CREATE INDEX idx_social_accounts_user_id ON social_accounts(user_id)`);

  await client.execute(`
    CREATE TABLE posts (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      scheduled_at TEXT,
      published_at TEXT,
      target_platforms TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  await client.execute(`CREATE INDEX idx_posts_user_id ON posts(user_id)`);
  await client.execute(`CREATE INDEX idx_posts_status ON posts(status)`);

  await client.execute(`
    CREATE TABLE post_media (
      id TEXT PRIMARY KEY NOT NULL,
      post_id TEXT NOT NULL,
      media_asset_id TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      alt_text TEXT
    )
  `);
  await client.execute(`CREATE INDEX idx_post_media_post_id ON post_media(post_id)`);

  await client.execute(`
    CREATE TABLE media_assets (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      blob_url TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
  await client.execute(`CREATE INDEX idx_media_assets_user_id ON media_assets(user_id)`);

  await client.execute(`
    CREATE TABLE post_logs (
      id TEXT PRIMARY KEY NOT NULL,
      post_id TEXT NOT NULL,
      platform TEXT NOT NULL,
      status TEXT NOT NULL,
      platform_post_id TEXT,
      error_message TEXT,
      published_at TEXT,
      created_at TEXT NOT NULL
    )
  `);
  await client.execute(`CREATE INDEX idx_post_logs_post_id ON post_logs(post_id)`);

  await client.execute(`
    CREATE TABLE analytics_daily (
      id TEXT PRIMARY KEY NOT NULL,
      social_account_id TEXT NOT NULL,
      date TEXT NOT NULL,
      followers INTEGER NOT NULL DEFAULT 0,
      engagement_rate REAL NOT NULL DEFAULT 0,
      impressions INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);
  await client.execute(`CREATE INDEX idx_analytics_daily_account_date ON analytics_daily(social_account_id, date)`);

  await client.execute(`
    CREATE TABLE analytics_posts (
      id TEXT PRIMARY KEY NOT NULL,
      post_id TEXT NOT NULL,
      platform TEXT NOT NULL,
      likes INTEGER NOT NULL DEFAULT 0,
      comments INTEGER NOT NULL DEFAULT 0,
      shares INTEGER NOT NULL DEFAULT 0,
      impressions INTEGER NOT NULL DEFAULT 0,
      clicks INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);
  await client.execute(`CREATE INDEX idx_analytics_posts_post_id ON analytics_posts(post_id)`);

  await client.execute(`
    CREATE TABLE ai_generations (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      prompt TEXT NOT NULL,
      result TEXT NOT NULL,
      model TEXT NOT NULL,
      tokens_used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);
  await client.execute(`CREATE INDEX idx_ai_generations_user_id ON ai_generations(user_id)`);

  await client.execute(`
    CREATE TABLE api_keys (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      key_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      permissions TEXT NOT NULL DEFAULT '[]',
      last_used_at TEXT,
      created_at TEXT NOT NULL
    )
  `);
  await client.execute(`CREATE INDEX idx_api_keys_user_id ON api_keys(user_id)`);
});

afterEach(() => {
  client.close();
});

describe('Schema: users', () => {
  it('inserts and reads a user', async () => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await client.execute({
      sql: 'INSERT INTO users (id, email, name, clerk_id, created_at) VALUES (?, ?, ?, ?, ?)',
      args: [id, 'test@example.com', 'Test User', 'clerk_123', now],
    });

    const result = await client.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [id] });
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].email).toBe('test@example.com');
    expect(result.rows[0].subscription_tier).toBe('free');
  });

  it('enforces unique email', async () => {
    const id1 = crypto.randomUUID();
    const id2 = crypto.randomUUID();
    const now = new Date().toISOString();

    await client.execute({
      sql: 'INSERT INTO users (id, email, clerk_id, created_at) VALUES (?, ?, ?, ?)',
      args: [id1, 'dupe@example.com', 'clerk_1', now],
    });

    await expect(
      client.execute({
        sql: 'INSERT INTO users (id, email, clerk_id, created_at) VALUES (?, ?, ?, ?)',
        args: [id2, 'dupe@example.com', 'clerk_2', now],
      })
    ).rejects.toThrow();
  });

  it('enforces unique clerk_id', async () => {
    const now = new Date().toISOString();
    await client.execute({
      sql: 'INSERT INTO users (id, email, clerk_id, created_at) VALUES (?, ?, ?, ?)',
      args: [crypto.randomUUID(), 'a@test.com', 'clerk_dup', now],
    });

    await expect(
      client.execute({
        sql: 'INSERT INTO users (id, email, clerk_id, created_at) VALUES (?, ?, ?, ?)',
        args: [crypto.randomUUID(), 'b@test.com', 'clerk_dup', now],
      })
    ).rejects.toThrow();
  });
});

describe('Schema: posts', () => {
  it('inserts a post with default status', async () => {
    const userId = crypto.randomUUID();
    const postId = crypto.randomUUID();
    const now = new Date().toISOString();

    await client.execute({
      sql: 'INSERT INTO users (id, email, clerk_id, created_at) VALUES (?, ?, ?, ?)',
      args: [userId, 'u@test.com', 'clerk_u', now],
    });

    await client.execute({
      sql: 'INSERT INTO posts (id, user_id, content, target_platforms, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [postId, userId, 'Hello world!', '["twitter"]', now, now],
    });

    const result = await client.execute({ sql: 'SELECT * FROM posts WHERE id = ?', args: [postId] });
    expect(result.rows[0].status).toBe('draft');
    expect(result.rows[0].target_platforms).toBe('["twitter"]');
  });
});

describe('Schema: social_accounts', () => {
  it('inserts a social account', async () => {
    const userId = crypto.randomUUID();
    const accountId = crypto.randomUUID();
    const now = new Date().toISOString();

    await client.execute({
      sql: 'INSERT INTO users (id, email, clerk_id, created_at) VALUES (?, ?, ?, ?)',
      args: [userId, 'u@test.com', 'clerk_u', now],
    });

    await client.execute({
      sql: 'INSERT INTO social_accounts (id, user_id, platform, access_token, username, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [accountId, userId, 'twitter', 'encrypted_token', '@testuser', now],
    });

    const result = await client.execute({
      sql: 'SELECT * FROM social_accounts WHERE user_id = ?',
      args: [userId],
    });
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].platform).toBe('twitter');
    expect(result.rows[0].status).toBe('active');
  });
});

describe('Schema: full workflow', () => {
  it('supports user -> post -> post_media -> media_assets chain', async () => {
    const userId = crypto.randomUUID();
    const postId = crypto.randomUUID();
    const mediaId = crypto.randomUUID();
    const postMediaId = crypto.randomUUID();
    const now = new Date().toISOString();

    await client.execute({
      sql: 'INSERT INTO users (id, email, clerk_id, created_at) VALUES (?, ?, ?, ?)',
      args: [userId, 'u@test.com', 'clerk_u', now],
    });

    await client.execute({
      sql: 'INSERT INTO posts (id, user_id, content, target_platforms, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [postId, userId, 'Check out this image!', '["twitter","linkedin"]', now, now],
    });

    await client.execute({
      sql: 'INSERT INTO media_assets (id, user_id, filename, blob_url, file_type, file_size, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [mediaId, userId, 'photo.jpg', 'https://blob.example.com/photo.jpg', 'image/jpeg', 1024000, now],
    });

    await client.execute({
      sql: 'INSERT INTO post_media (id, post_id, media_asset_id, sort_order, alt_text) VALUES (?, ?, ?, ?, ?)',
      args: [postMediaId, postId, mediaId, 0, 'A photo'],
    });

    // Query the chain
    const result = await client.execute({
      sql: `SELECT p.content, m.filename, m.blob_url, pm.alt_text
            FROM posts p
            JOIN post_media pm ON pm.post_id = p.id
            JOIN media_assets m ON m.id = pm.media_asset_id
            WHERE p.id = ?`,
      args: [postId],
    });

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].content).toBe('Check out this image!');
    expect(result.rows[0].filename).toBe('photo.jpg');
    expect(result.rows[0].alt_text).toBe('A photo');
  });
});
