import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT, DELETE } from '../route';

vi.mock('@/lib/auth-helpers', () => ({
  requireUser: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  getBookingPageById: vi.fn(),
  updateBookingPage: vi.fn(),
  deleteBookingPage: vi.fn(),
}));

import { requireUser } from '@/lib/auth-helpers';
import { getBookingPageById, updateBookingPage, deleteBookingPage } from '@/lib/db';

const mockRequireUser = vi.mocked(requireUser);
const mockGetById = vi.mocked(getBookingPageById);
const mockUpdate = vi.mocked(updateBookingPage);
const mockDelete = vi.mocked(deleteBookingPage);

const testPage = { id: 'page-1', user_id: 'u1', slug: 'test', title: 'Test', description: null, brand_color: '#3b82f6', logo_url: null, created_at: '2024-01-01' };

function createRequest(method: string, body?: unknown) {
  return new Request('http://localhost:3000/api/pages/page-1', {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
}

const params = Promise.resolve({ id: 'page-1' });

describe('GET /api/pages/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    mockRequireUser.mockRejectedValue(new Error('Unauthorized'));
    const res = await GET(createRequest('GET'), { params });
    expect(res.status).toBe(401);
  });

  it('returns 404 when page not found', async () => {
    mockRequireUser.mockResolvedValue({ id: 'u1', name: 'Test', email: 'test@test.com' });
    mockGetById.mockResolvedValue(null);
    const res = await GET(createRequest('GET'), { params });
    expect(res.status).toBe(404);
  });

  it('returns 403 when user is not the owner', async () => {
    mockRequireUser.mockResolvedValue({ id: 'other-user', name: 'Test', email: 'test@test.com' });
    mockGetById.mockResolvedValue(testPage);
    const res = await GET(createRequest('GET'), { params });
    expect(res.status).toBe(403);
  });

  it('returns the page when user is the owner', async () => {
    mockRequireUser.mockResolvedValue({ id: 'u1', name: 'Test', email: 'test@test.com' });
    mockGetById.mockResolvedValue(testPage);
    const res = await GET(createRequest('GET'), { params });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.page.title).toBe('Test');
  });
});

describe('PUT /api/pages/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    mockRequireUser.mockRejectedValue(new Error('Unauthorized'));
    const res = await PUT(createRequest('PUT', { title: 'Updated' }), { params });
    expect(res.status).toBe(401);
  });

  it('returns 404 when page not found', async () => {
    mockRequireUser.mockResolvedValue({ id: 'u1', name: 'Test', email: 'test@test.com' });
    mockGetById.mockResolvedValue(null);
    const res = await PUT(createRequest('PUT', { title: 'Updated' }), { params });
    expect(res.status).toBe(404);
  });

  it('returns 403 when user is not the owner', async () => {
    mockRequireUser.mockResolvedValue({ id: 'other-user', name: 'Test', email: 'test@test.com' });
    mockGetById.mockResolvedValue(testPage);
    const res = await PUT(createRequest('PUT', { title: 'Updated' }), { params });
    expect(res.status).toBe(403);
  });

  it('updates the page', async () => {
    mockRequireUser.mockResolvedValue({ id: 'u1', name: 'Test', email: 'test@test.com' });
    mockGetById.mockResolvedValue(testPage);
    mockUpdate.mockResolvedValue({ ...testPage, title: 'Updated' });
    const res = await PUT(createRequest('PUT', { title: 'Updated' }), { params });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.page.title).toBe('Updated');
  });
});

describe('DELETE /api/pages/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth', async () => {
    mockRequireUser.mockRejectedValue(new Error('Unauthorized'));
    const res = await DELETE(createRequest('DELETE'), { params });
    expect(res.status).toBe(401);
  });

  it('returns 404 when page not found', async () => {
    mockRequireUser.mockResolvedValue({ id: 'u1', name: 'Test', email: 'test@test.com' });
    mockGetById.mockResolvedValue(null);
    const res = await DELETE(createRequest('DELETE'), { params });
    expect(res.status).toBe(404);
  });

  it('returns 403 when user is not the owner', async () => {
    mockRequireUser.mockResolvedValue({ id: 'other-user', name: 'Test', email: 'test@test.com' });
    mockGetById.mockResolvedValue(testPage);
    const res = await DELETE(createRequest('DELETE'), { params });
    expect(res.status).toBe(403);
  });

  it('deletes the page', async () => {
    mockRequireUser.mockResolvedValue({ id: 'u1', name: 'Test', email: 'test@test.com' });
    mockGetById.mockResolvedValue(testPage);
    mockDelete.mockResolvedValue(true);
    const res = await DELETE(createRequest('DELETE'), { params });
    expect(res.status).toBe(200);
  });
});
