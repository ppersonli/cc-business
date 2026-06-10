import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCurrentUser, requireUser } from '../auth-helpers';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

import { auth } from '@/auth';
const mockAuth = vi.mocked(auth);

describe('getCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when no session exists', async () => {
    mockAuth.mockResolvedValue(null);
    const user = await getCurrentUser();
    expect(user).toBeNull();
  });

  it('returns null when session has no user', async () => {
    mockAuth.mockResolvedValue({ user: null } as never);
    const user = await getCurrentUser();
    expect(user).toBeNull();
  });

  it('returns null when user has no id', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'Test' } } as never);
    const user = await getCurrentUser();
    expect(user).toBeNull();
  });

  it('returns user when session is valid', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
    } as never);
    const user = await getCurrentUser();
    expect(user).toEqual({
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
    });
  });
});

describe('requireUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws when no session exists', async () => {
    mockAuth.mockResolvedValue(null);
    await expect(requireUser()).rejects.toThrow('Unauthorized');
  });

  it('returns user when session is valid', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
    } as never);
    const user = await requireUser();
    expect(user.id).toBe('user-123');
  });
});
