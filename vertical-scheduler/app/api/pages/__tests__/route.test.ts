import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../route';

vi.mock('@/lib/auth-helpers', () => ({
  requireUser: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  createBookingPage: vi.fn(),
  getBookingPagesByUserId: vi.fn(),
  getBookingPageBySlug: vi.fn(),
}));

import { requireUser } from '@/lib/auth-helpers';
import { createBookingPage, getBookingPagesByUserId, getBookingPageBySlug } from '@/lib/db';

const mockRequireUser = vi.mocked(requireUser);
const mockCreate = vi.mocked(createBookingPage);
const mockGetByUserId = vi.mocked(getBookingPagesByUserId);
const mockGetBySlug = vi.mocked(getBookingPageBySlug);

function createRequest(body?: unknown) {
  return new Request('http://localhost:3000/api/pages', {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('GET /api/pages', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    mockRequireUser.mockRejectedValue(new Error('Unauthorized'));
    const res = await GET(createRequest());
    expect(res.status).toBe(401);
  });

  it('returns user pages with auth', async () => {
    mockRequireUser.mockResolvedValue({ id: 'u1', name: 'Test', email: 'test@test.com' });
    mockGetByUserId.mockResolvedValue([
      { id: 'p1', user_id: 'u1', slug: 'page-1', title: 'Page 1', description: null, brand_color: '#3b82f6', logo_url: null, created_at: '2024-01-01' },
    ]);

    const res = await GET(createRequest());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.pages).toHaveLength(1);
    expect(data.pages[0].title).toBe('Page 1');
  });
});

describe('POST /api/pages', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    mockRequireUser.mockRejectedValue(new Error('Unauthorized'));
    const res = await POST(createRequest({ title: 'Test', slug: 'test' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 with missing title', async () => {
    mockRequireUser.mockResolvedValue({ id: 'u1', name: 'Test', email: 'test@test.com' });
    const res = await POST(createRequest({ slug: 'test' }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error.toLowerCase()).toContain('title');
  });

  it('returns 400 with missing slug', async () => {
    mockRequireUser.mockResolvedValue({ id: 'u1', name: 'Test', email: 'test@test.com' });
    const res = await POST(createRequest({ title: 'Test' }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error.toLowerCase()).toContain('slug');
  });

  it('returns 400 with invalid slug format', async () => {
    mockRequireUser.mockResolvedValue({ id: 'u1', name: 'Test', email: 'test@test.com' });
    const res = await POST(createRequest({ title: 'Test', slug: 'Invalid Slug!' }));
    expect(res.status).toBe(400);
  });

  it('returns 409 with duplicate slug', async () => {
    mockRequireUser.mockResolvedValue({ id: 'u1', name: 'Test', email: 'test@test.com' });
    mockGetBySlug.mockResolvedValue({ id: 'existing', user_id: 'u1', slug: 'taken', title: 'Taken', description: null, brand_color: '#3b82f6', logo_url: null, created_at: '2024-01-01' });
    const res = await POST(createRequest({ title: 'Test', slug: 'taken' }));
    expect(res.status).toBe(409);
  });

  it('creates a page with valid input', async () => {
    mockRequireUser.mockResolvedValue({ id: 'u1', name: 'Test', email: 'test@test.com' });
    mockGetBySlug.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: 'new-page', user_id: 'u1', slug: 'new-page', title: 'New Page', description: null, brand_color: '#3b82f6', logo_url: null, created_at: '2024-01-01' });

    const res = await POST(createRequest({ title: 'New Page', slug: 'new-page' }));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.page.title).toBe('New Page');
  });
});
