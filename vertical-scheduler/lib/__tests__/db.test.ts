import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createClient } from '@libsql/client';
import { setClient, initSchema, createBookingPage, getBookingPagesByUserId, getBookingPageById, getBookingPageBySlug, updateBookingPage, deleteBookingPage } from '../db';
import { v4 as uuidv4 } from 'uuid';

let testClient: ReturnType<typeof createClient>;

beforeEach(async () => {
  testClient = createClient({ url: ':memory:' });
  setClient(testClient);
  await initSchema();
});

afterEach(() => {
  testClient.close();
});

describe('initSchema', () => {
  it('creates all tables without error', async () => {
    const result = await testClient.execute(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );
    const tables = result.rows.map(r => r.name);
    expect(tables).toContain('users');
    expect(tables).toContain('booking_pages');
    expect(tables).toContain('services');
    expect(tables).toContain('availability');
    expect(tables).toContain('bookings');
    expect(tables).toContain('payments');
  });

  it('is idempotent (can run twice)', async () => {
    await initSchema();
    const result = await testClient.execute(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    expect(result.rows.length).toBeGreaterThanOrEqual(6);
  });
});

describe('createBookingPage', () => {
  it('creates a booking page with all fields', async () => {
    const userId = uuidv4();
    await testClient.execute({
      sql: 'INSERT INTO users (id, email) VALUES (?, ?)',
      args: [userId, 'test@example.com'],
    });

    const page = await createBookingPage(userId, {
      title: 'My Booking Page',
      slug: 'my-booking-page',
      description: 'A test page',
      brandColor: '#ff0000',
    });

    expect(page.id).toBeDefined();
    expect(page.title).toBe('My Booking Page');
    expect(page.slug).toBe('my-booking-page');
    expect(page.description).toBe('A test page');
    expect(page.brand_color).toBe('#ff0000');
    expect(page.user_id).toBe(userId);
  });

  it('creates a booking page with minimal fields', async () => {
    const userId = uuidv4();
    await testClient.execute({
      sql: 'INSERT INTO users (id, email) VALUES (?, ?)',
      args: [userId, 'test@example.com'],
    });

    const page = await createBookingPage(userId, {
      title: 'Minimal Page',
      slug: 'minimal',
    });

    expect(page.title).toBe('Minimal Page');
    expect(page.brand_color).toBe('#3b82f6');
    expect(page.description).toBeNull();
    expect(page.logo_url).toBeNull();
  });
});

describe('getBookingPagesByUserId', () => {
  it('returns pages for the specified user only', async () => {
    const userId1 = uuidv4();
    const userId2 = uuidv4();
    await testClient.execute({ sql: 'INSERT INTO users (id, email) VALUES (?, ?)', args: [userId1, 'u1@test.com'] });
    await testClient.execute({ sql: 'INSERT INTO users (id, email) VALUES (?, ?)', args: [userId2, 'u2@test.com'] });

    await createBookingPage(userId1, { title: 'Page 1', slug: 'page-1' });
    await createBookingPage(userId1, { title: 'Page 2', slug: 'page-2' });
    await createBookingPage(userId2, { title: 'Page 3', slug: 'page-3' });

    const pages = await getBookingPagesByUserId(userId1);
    expect(pages).toHaveLength(2);
    expect(pages.every(p => p.user_id === userId1)).toBe(true);
  });

  it('returns empty array for user with no pages', async () => {
    const pages = await getBookingPagesByUserId(uuidv4());
    expect(pages).toHaveLength(0);
  });
});

describe('getBookingPageById', () => {
  it('returns the page when it exists', async () => {
    const userId = uuidv4();
    await testClient.execute({ sql: 'INSERT INTO users (id, email) VALUES (?, ?)', args: [userId, 'test@test.com'] });
    const created = await createBookingPage(userId, { title: 'Test', slug: 'test' });

    const found = await getBookingPageById(created.id);
    expect(found).not.toBeNull();
    expect(found!.title).toBe('Test');
  });

  it('returns null when page does not exist', async () => {
    const found = await getBookingPageById('nonexistent-id');
    expect(found).toBeNull();
  });
});

describe('getBookingPageBySlug', () => {
  it('returns the page by slug', async () => {
    const userId = uuidv4();
    await testClient.execute({ sql: 'INSERT INTO users (id, email) VALUES (?, ?)', args: [userId, 'test@test.com'] });
    await createBookingPage(userId, { title: 'By Slug', slug: 'by-slug' });

    const found = await getBookingPageBySlug('by-slug');
    expect(found).not.toBeNull();
    expect(found!.title).toBe('By Slug');
  });

  it('returns null for non-existent slug', async () => {
    const found = await getBookingPageBySlug('no-such-slug');
    expect(found).toBeNull();
  });
});

describe('updateBookingPage', () => {
  it('updates specified fields', async () => {
    const userId = uuidv4();
    await testClient.execute({ sql: 'INSERT INTO users (id, email) VALUES (?, ?)', args: [userId, 'test@test.com'] });
    const page = await createBookingPage(userId, { title: 'Original', slug: 'original' });

    const updated = await updateBookingPage(page.id, { title: 'Updated', brandColor: '#00ff00' });
    expect(updated!.title).toBe('Updated');
    expect(updated!.brand_color).toBe('#00ff00');
    expect(updated!.slug).toBe('original'); // unchanged
  });

  it('returns null for non-existent page', async () => {
    const result = await updateBookingPage('nonexistent', { title: 'Nope' });
    expect(result).toBeNull();
  });

  it('returns existing page when no fields to update', async () => {
    const userId = uuidv4();
    await testClient.execute({ sql: 'INSERT INTO users (id, email) VALUES (?, ?)', args: [userId, 'test@test.com'] });
    const page = await createBookingPage(userId, { title: 'Same', slug: 'same' });

    const result = await updateBookingPage(page.id, {});
    expect(result!.title).toBe('Same');
  });
});

describe('deleteBookingPage', () => {
  it('deletes the page and returns true', async () => {
    const userId = uuidv4();
    await testClient.execute({ sql: 'INSERT INTO users (id, email) VALUES (?, ?)', args: [userId, 'test@test.com'] });
    const page = await createBookingPage(userId, { title: 'Delete Me', slug: 'delete-me' });

    const deleted = await deleteBookingPage(page.id);
    expect(deleted).toBe(true);

    const found = await getBookingPageById(page.id);
    expect(found).toBeNull();
  });

  it('returns false for non-existent page', async () => {
    const result = await deleteBookingPage('nonexistent');
    expect(result).toBe(false);
  });
});

describe('slug uniqueness', () => {
  it('rejects duplicate slugs', async () => {
    const userId = uuidv4();
    await testClient.execute({ sql: 'INSERT INTO users (id, email) VALUES (?, ?)', args: [userId, 'test@test.com'] });
    await createBookingPage(userId, { title: 'First', slug: 'unique-slug' });

    await expect(
      createBookingPage(userId, { title: 'Second', slug: 'unique-slug' })
    ).rejects.toThrow();
  });
});
