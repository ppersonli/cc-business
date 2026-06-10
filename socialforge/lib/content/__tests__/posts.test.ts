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

  // Create tables
  await client.execute(`CREATE TABLE users (id TEXT PRIMARY KEY NOT NULL, email TEXT NOT NULL UNIQUE, name TEXT, clerk_id TEXT NOT NULL UNIQUE, image_url TEXT, subscription_tier TEXT NOT NULL DEFAULT 'free', created_at TEXT NOT NULL)`);
  await client.execute(`CREATE TABLE posts (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, content TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft', scheduled_at TEXT, published_at TEXT, target_platforms TEXT NOT NULL DEFAULT '[]', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`);
  await client.execute(`CREATE TABLE media_assets (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, filename TEXT NOT NULL, blob_url TEXT NOT NULL, file_type TEXT NOT NULL, file_size INTEGER NOT NULL, created_at TEXT NOT NULL)`);
  await client.execute(`CREATE TABLE post_media (id TEXT PRIMARY KEY NOT NULL, post_id TEXT NOT NULL, media_asset_id TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, alt_text TEXT)`);

  userId = generateId();
  await client.execute({
    sql: 'INSERT INTO users (id, email, clerk_id, created_at) VALUES (?, ?, ?, ?)',
    args: [userId, 'test@example.com', 'clerk_test', new Date().toISOString()],
  });
});

afterEach(() => { client.close(); });

describe('Post CRUD', () => {
  it('creates a draft post', async () => {
    const postId = generateId();
    const now = new Date().toISOString();

    await client.execute({
      sql: 'INSERT INTO posts (id, user_id, content, target_platforms, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [postId, userId, 'Hello world!', '["twitter"]', now, now],
    });

    const result = await client.execute({ sql: 'SELECT * FROM posts WHERE id = ?', args: [postId] });
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].content).toBe('Hello world!');
    expect(result.rows[0].status).toBe('draft');
    expect(result.rows[0].target_platforms).toBe('["twitter"]');
  });

  it('lists posts for a user', async () => {
    const now = new Date().toISOString();
    for (let i = 0; i < 3; i++) {
      await client.execute({
        sql: 'INSERT INTO posts (id, user_id, content, target_platforms, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        args: [generateId(), userId, `Post ${i}`, '[]', now, now],
      });
    }

    const result = await client.execute({ sql: 'SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC', args: [userId] });
    expect(result.rows).toHaveLength(3);
  });

  it('updates post content', async () => {
    const postId = generateId();
    const now = new Date().toISOString();
    await client.execute({
      sql: 'INSERT INTO posts (id, user_id, content, target_platforms, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [postId, userId, 'Original', '[]', now, now],
    });

    const updatedNow = new Date().toISOString();
    await client.execute({
      sql: 'UPDATE posts SET content = ?, updated_at = ? WHERE id = ?',
      args: ['Updated content', updatedNow, postId],
    });

    const result = await client.execute({ sql: 'SELECT content FROM posts WHERE id = ?', args: [postId] });
    expect(result.rows[0].content).toBe('Updated content');
  });

  it('deletes a post', async () => {
    const postId = generateId();
    const now = new Date().toISOString();
    await client.execute({
      sql: 'INSERT INTO posts (id, user_id, content, target_platforms, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [postId, userId, 'Delete me', '[]', now, now],
    });

    await client.execute({ sql: 'DELETE FROM posts WHERE id = ?', args: [postId] });
    const result = await client.execute({ sql: 'SELECT * FROM posts WHERE id = ?', args: [postId] });
    expect(result.rows).toHaveLength(0);
  });

  it('changes post status', async () => {
    const postId = generateId();
    const now = new Date().toISOString();
    await client.execute({
      sql: 'INSERT INTO posts (id, user_id, content, target_platforms, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [postId, userId, 'Schedule me', '["twitter"]', now, now],
    });

    await client.execute({
      sql: "UPDATE posts SET status = 'scheduled', scheduled_at = ? WHERE id = ?",
      args: ['2026-06-15T10:00:00Z', postId],
    });

    const result = await client.execute({ sql: 'SELECT status, scheduled_at FROM posts WHERE id = ?', args: [postId] });
    expect(result.rows[0].status).toBe('scheduled');
    expect(result.rows[0].scheduled_at).toBe('2026-06-15T10:00:00Z');
  });
});

describe('Media CRUD', () => {
  it('creates a media asset', async () => {
    const mediaId = generateId();
    const now = new Date().toISOString();

    await client.execute({
      sql: 'INSERT INTO media_assets (id, user_id, filename, blob_url, file_type, file_size, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [mediaId, userId, 'photo.jpg', 'https://blob.example.com/photo.jpg', 'image/jpeg', 1024000, now],
    });

    const result = await client.execute({ sql: 'SELECT * FROM media_assets WHERE id = ?', args: [mediaId] });
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].filename).toBe('photo.jpg');
  });

  it('links media to a post', async () => {
    const postId = generateId();
    const mediaId = generateId();
    const postMediaId = generateId();
    const now = new Date().toISOString();

    await client.execute({
      sql: 'INSERT INTO posts (id, user_id, content, target_platforms, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [postId, userId, 'Post with image', '[]', now, now],
    });

    await client.execute({
      sql: 'INSERT INTO media_assets (id, user_id, filename, blob_url, file_type, file_size, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [mediaId, userId, 'img.jpg', 'https://blob.example.com/img.jpg', 'image/jpeg', 500000, now],
    });

    await client.execute({
      sql: 'INSERT INTO post_media (id, post_id, media_asset_id, sort_order, alt_text) VALUES (?, ?, ?, ?, ?)',
      args: [postMediaId, postId, mediaId, 0, 'An image'],
    });

    const result = await client.execute({
      sql: 'SELECT pm.*, m.filename FROM post_media pm JOIN media_assets m ON m.id = pm.media_asset_id WHERE pm.post_id = ?',
      args: [postId],
    });
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].filename).toBe('img.jpg');
    expect(result.rows[0].alt_text).toBe('An image');
  });

  it('lists media for a user', async () => {
    const now = new Date().toISOString();
    for (let i = 0; i < 3; i++) {
      await client.execute({
        sql: 'INSERT INTO media_assets (id, user_id, filename, blob_url, file_type, file_size, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        args: [generateId(), userId, `file${i}.jpg`, `https://blob.example.com/file${i}.jpg`, 'image/jpeg', 100000, now],
      });
    }

    const result = await client.execute({ sql: 'SELECT * FROM media_assets WHERE user_id = ?', args: [userId] });
    expect(result.rows).toHaveLength(3);
  });
});
