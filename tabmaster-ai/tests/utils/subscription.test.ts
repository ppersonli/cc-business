import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  decodeJwtPayload,
  getAuthCookie,
  getOrCreateUserId,
  getSubscriptionState,
  refreshSubscription,
} from '../../utils/subscription';

// Build a simple JWT with the given payload (no real signing)
function makeJwt(payload: Record<string, any>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${header}.${body}.fake-sig`;
}

const mockStorage: Record<string, any> = {};
let mockCookies: Record<string, any> = {};

const chromeMock = {
  storage: {
    local: {
      get: vi.fn(async (keys: string[]) => {
        const result: Record<string, any> = {};
        for (const key of keys) {
          if (key in mockStorage) result[key] = mockStorage[key];
        }
        return result;
      }),
      set: vi.fn(async (items: Record<string, any>) => {
        Object.assign(mockStorage, items);
      }),
      remove: vi.fn(async (key: string) => {
        delete mockStorage[key];
      }),
    },
  },
  cookies: {
    get: vi.fn(async () => mockCookies.cookie ?? null),
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
  mockCookies = {};
  (globalThis as any).chrome = chromeMock;
});

afterEach(() => {
  delete (globalThis as any).chrome;
});

describe('decodeJwtPayload', () => {
  it('decodes a valid JWT payload', () => {
    const payload = { sub: 'user123', email: 'test@test.com' };
    const token = makeJwt(payload);
    const result = decodeJwtPayload(token);
    expect(result).toEqual(payload);
  });

  it('returns null for invalid token format', () => {
    expect(decodeJwtPayload('not-a-jwt')).toBeNull();
  });

  it('returns null for token with wrong number of parts', () => {
    expect(decodeJwtPayload('only.two')).toBeNull();
  });

  it('returns null for malformed base64', () => {
    expect(decodeJwtPayload('a.!!!.b')).toBeNull();
  });
});

describe('getAuthCookie', () => {
  it('returns userId and email when cookie is present and valid', async () => {
    const exp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    mockCookies.cookie = { value: makeJwt({ sub: 'u1', email: 'a@b.com', exp }) };
    const result = await getAuthCookie();
    expect(result).toEqual({ userId: 'u1', email: 'a@b.com' });
  });

  it('returns null when cookie is missing', async () => {
    const result = await getAuthCookie();
    expect(result).toBeNull();
  });

  it('returns null when JWT is expired', async () => {
    const exp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    mockCookies.cookie = { value: makeJwt({ sub: 'u1', email: 'a@b.com', exp }) };
    const result = await getAuthCookie();
    expect(result).toBeNull();
  });

  it('returns null when payload has no sub', async () => {
    mockCookies.cookie = { value: makeJwt({ email: 'a@b.com' }) };
    const result = await getAuthCookie();
    expect(result).toBeNull();
  });
});

describe('getOrCreateUserId', () => {
  it('returns authenticated userId when cookie is present', async () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    mockCookies.cookie = { value: makeJwt({ sub: 'auth-user', email: 'a@b.com', exp }) };
    const id = await getOrCreateUserId();
    expect(id).toBe('auth-user');
    expect(mockStorage.userId).toBe('auth-user');
    expect(mockStorage.isAnonymous).toBe(false);
  });

  it('returns existing anonymous userId from storage', async () => {
    mockStorage.userId = 'anon-uuid';
    mockStorage.isAnonymous = true;
    const id = await getOrCreateUserId();
    expect(id).toBe('anon-uuid');
  });

  it('generates a new userId when nothing exists', async () => {
    const id = await getOrCreateUserId();
    expect(id).toBeTruthy();
    expect(typeof id).toBe('string');
    expect(mockStorage.isAnonymous).toBe(true);
  });
});

describe('getSubscriptionState', () => {
  it('returns cached subscription when cache is fresh', async () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    mockCookies.cookie = { value: makeJwt({ sub: 'u1', email: 'a@b.com', exp }) };
    mockStorage.subscriptionPlan = 'pro';
    mockStorage.subscriptionExpiresAt = Date.now() + 86400000;
    mockStorage.subscriptionLastCheck = Date.now();

    const state = await getSubscriptionState();
    expect(state.plan).toBe('pro');
    expect(state.isPro).toBe(true);
  });

  it('fetches from backend when cache is stale', async () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    mockCookies.cookie = { value: makeJwt({ sub: 'u1', email: 'a@b.com', exp }) };
    mockStorage.subscriptionLastCheck = 0; // stale

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ plan: 'pro-yearly', isPro: true, expiresAt: 999 }),
    } as Response);

    const state = await getSubscriptionState();
    expect(state.plan).toBe('pro-yearly');
    expect(state.isPro).toBe(true);
    expect(state.expiresAt).toBe(999);
    expect(mockStorage.subscriptionPlan).toBe('pro-yearly');

    fetchSpy.mockRestore();
  });

  it('falls back to free on network error', async () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    mockCookies.cookie = { value: makeJwt({ sub: 'u1', email: 'a@b.com', exp }) };
    mockStorage.subscriptionLastCheck = 0;

    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));

    const state = await getSubscriptionState();
    expect(state.plan).toBe('free');
    expect(state.isPro).toBe(false);
  });
});

describe('refreshSubscription', () => {
  it('clears cache and fetches fresh state', async () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    mockCookies.cookie = { value: makeJwt({ sub: 'u1', email: 'a@b.com', exp }) };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ plan: 'pro', isPro: true }),
    } as Response);

    const state = await refreshSubscription();
    expect(chromeMock.storage.local.remove).toHaveBeenCalledWith('subscriptionLastCheck');
    expect(state.plan).toBe('pro');

    fetchSpy.mockRestore();
  });
});
