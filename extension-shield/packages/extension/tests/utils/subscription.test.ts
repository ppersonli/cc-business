import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAuthCookie,
  getOrCreateUserId,
  getSubscriptionState,
  getDailyUsage,
  canUse,
  incrementUsage,
  refreshSubscription,
} from '../../utils/subscription';

const testStorage = (globalThis as any).__testStorage;
const testCookies = (globalThis as any).__testCookies;

function makeJwt(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

describe('getAuthCookie', () => {
  beforeEach(() => {
    for (const key of Object.keys(testStorage)) delete testStorage[key];
    for (const key of Object.keys(testCookies)) delete testCookies[key];
  });

  it('returns null when no cookie', async () => {
    const result = await getAuthCookie();
    expect(result).toBeNull();
  });

  it('returns userId and email from valid JWT', async () => {
    const jwt = makeJwt({ sub: 'user123', email: 'test@example.com', exp: Math.floor(Date.now() / 1000) + 3600 });
    testCookies['https://tools.pixiaoli.cn:auth_token'] = jwt;
    const result = await getAuthCookie();
    expect(result).toEqual({ userId: 'user123', email: 'test@example.com' });
  });

  it('returns null for expired JWT', async () => {
    const jwt = makeJwt({ sub: 'user123', exp: Math.floor(Date.now() / 1000) - 3600 });
    testCookies['https://tools.pixiaoli.cn:auth_token'] = jwt;
    const result = await getAuthCookie();
    expect(result).toBeNull();
  });

  it('returns null for malformed JWT', async () => {
    testCookies['https://tools.pixiaoli.cn:auth_token'] = 'not.a.jwt.at.all';
    const result = await getAuthCookie();
    expect(result).toBeNull();
  });
});

describe('getOrCreateUserId', () => {
  beforeEach(() => {
    for (const key of Object.keys(testStorage)) delete testStorage[key];
    for (const key of Object.keys(testCookies)) delete testCookies[key];
  });

  it('returns authenticated userId when cookie exists', async () => {
    const jwt = makeJwt({ sub: 'auth-user', exp: Math.floor(Date.now() / 1000) + 3600 });
    testCookies['https://tools.pixiaoli.cn:auth_token'] = jwt;
    const userId = await getOrCreateUserId();
    expect(userId).toBe('auth-user');
  });

  it('creates anonymous UUID when no cookie', async () => {
    const userId = await getOrCreateUserId();
    expect(userId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it('caches anonymous UUID', async () => {
    const userId1 = await getOrCreateUserId();
    const userId2 = await getOrCreateUserId();
    expect(userId1).toBe(userId2);
  });
});

describe('getSubscriptionState', () => {
  beforeEach(() => {
    for (const key of Object.keys(testStorage)) delete testStorage[key];
    for (const key of Object.keys(testCookies)) delete testCookies[key];
  });

  it('returns free plan on backend error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const state = await getSubscriptionState();
    expect(state.plan).toBe('free');
    expect(state.isPro).toBe(false);
  });

  it('returns cached state within TTL', async () => {
    testStorage.es_subscriptionPlan = { plan: 'shield-pro-monthly', isPro: true };
    testStorage.es_subscriptionCacheTime = Date.now();
    const state = await getSubscriptionState();
    expect(state.plan).toBe('shield-pro-monthly');
    expect(state.isPro).toBe(true);
  });
});

describe('getDailyUsage', () => {
  beforeEach(() => {
    for (const key of Object.keys(testStorage)) delete testStorage[key];
    for (const key of Object.keys(testCookies)) delete testCookies[key];
  });

  it('returns 0 count for new day', async () => {
    const usage = await getDailyUsage();
    expect(usage.count).toBe(0);
    expect(usage.remaining).toBe(3);
  });

  it('returns Infinity for pro users', async () => {
    testStorage.es_subscriptionPlan = { plan: 'shield-pro-monthly', isPro: true };
    testStorage.es_subscriptionCacheTime = Date.now();
    const usage = await getDailyUsage();
    expect(usage.remaining).toBe(Infinity);
  });

  it('resets count on new day', async () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    testStorage.es_usageDate = yesterday;
    testStorage.es_usageCount = 3;
    const usage = await getDailyUsage();
    expect(usage.count).toBe(0);
  });
});

describe('canUse and incrementUsage', () => {
  beforeEach(() => {
    for (const key of Object.keys(testStorage)) delete testStorage[key];
    for (const key of Object.keys(testCookies)) delete testCookies[key];
  });

  it('allows use within free limit', async () => {
    const result = await canUse();
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(3);
  });

  it('blocks use when limit reached', async () => {
    const today = new Date().toISOString().slice(0, 10);
    testStorage.es_usageDate = today;
    testStorage.es_usageCount = 3;
    const result = await canUse();
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('increments usage count', async () => {
    await incrementUsage();
    const today = new Date().toISOString().slice(0, 10);
    expect(testStorage.es_usageDate).toBe(today);
    expect(testStorage.es_usageCount).toBe(1);
  });
});

describe('refreshSubscription', () => {
  it('clears subscription cache', async () => {
    testStorage.es_subscriptionPlan = { plan: 'free' };
    testStorage.es_subscriptionCacheTime = Date.now();
    await refreshSubscription();
    expect(testStorage.es_subscriptionPlan).toBeUndefined();
    expect(testStorage.es_subscriptionCacheTime).toBeUndefined();
  });
});
