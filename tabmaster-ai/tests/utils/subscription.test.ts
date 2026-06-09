import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getAuthCookie,
  getOrCreateUserId,
  getSubscriptionState,
  canClassify,
  canSearch,
  incrementClassifyUsage,
  incrementSearchUsage,
  getAIUsageSummary,
  FREE_AI_CLASSIFY_LIMIT,
  FREE_AI_SEARCH_LIMIT,
} from '~/utils/subscription';

let originalCookiesGet: ((details: any) => Promise<any>) | undefined;

describe('utils/subscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).browser.storage.local.data = {};
    (globalThis as any).chrome.cookies.data = {};
    // Save original cookies.get so tests that replace it can be restored
    originalCookiesGet = (globalThis as any).chrome.cookies.get;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ isPro: false, plan: 'free' }),
    }));
  });

  afterEach(() => {
    if (originalCookiesGet) {
      (globalThis as any).chrome.cookies.get = originalCookiesGet;
    }
  });

  describe('getAuthCookie', () => {
    it('returns null when no auth cookie exists', async () => {
      const result = await getAuthCookie();
      expect(result).toBeNull();
    });

    it('parses a valid JWT cookie', async () => {
      const payload = { sub: 42, email: 'test@gmail.com', exp: Math.floor(Date.now() / 1000) + 3600 };
      const encoded = btoa(JSON.stringify(payload));
      vi.spyOn((globalThis as any).chrome.cookies, 'get').mockResolvedValueOnce({
        name: 'auth_token', value: `header.${encoded}.sig`, domain: '.pixiaoli.cn', path: '/',
      });

      const result = await getAuthCookie();
      expect(result).toEqual({ userId: '42', email: 'test@gmail.com' });
    });

    it('returns null for expired JWT', async () => {
      const payload = { sub: 42, email: 'test@gmail.com', exp: Math.floor(Date.now() / 1000) - 3600 };
      const encoded = btoa(JSON.stringify(payload));
      vi.spyOn((globalThis as any).chrome.cookies, 'get').mockResolvedValueOnce({
        name: 'auth_token', value: `header.${encoded}.sig`, domain: '.pixiaoli.cn', path: '/',
      });

      const result = await getAuthCookie();
      expect(result).toBeNull();
    });

    it('returns null for malformed JWT', async () => {
      vi.spyOn((globalThis as any).chrome.cookies, 'get').mockResolvedValueOnce({
        name: 'auth_token', value: 'not-a-jwt', domain: '.pixiaoli.cn', path: '/',
      });
      const result = await getAuthCookie();
      expect(result).toBeNull();
    });

    it('returns null when cookies API throws', async () => {
      vi.spyOn((globalThis as any).chrome.cookies, 'get').mockRejectedValueOnce(new Error('no permission'));
      const result = await getAuthCookie();
      expect(result).toBeNull();
    });

    it('returns null when JWT has no sub claim', async () => {
      const payload = { email: 'test@gmail.com', exp: Math.floor(Date.now() / 1000) + 3600 };
      const encoded = btoa(JSON.stringify(payload));
      vi.spyOn((globalThis as any).chrome.cookies, 'get').mockResolvedValueOnce({
        name: 'auth_token', value: `header.${encoded}.sig`, domain: '.pixiaoli.cn', path: '/',
      });

      const result = await getAuthCookie();
      expect(result).toBeNull();
    });
  });

  describe('getOrCreateUserId', () => {
    it('returns authenticated userId when cookie is present', async () => {
      const payload = { sub: 42, email: 'test@gmail.com', exp: Math.floor(Date.now() / 1000) + 3600 };
      const encoded = btoa(JSON.stringify(payload));
      const token = `header.${encoded}.sig`;
      vi.spyOn((globalThis as any).chrome.cookies, 'get').mockResolvedValueOnce({
        name: 'auth_token', value: token, domain: '.pixiaoli.cn', path: '/',
      });

      const userId = await getOrCreateUserId();
      expect(userId).toBe('42');
    });

    it('falls back to anonymous UUID when no cookie', async () => {
      const userId = await getOrCreateUserId();
      expect(typeof userId).toBe('string');
      expect(userId.length).toBeGreaterThan(0);
    });

    it('generates userId without crypto.randomUUID when unavailable', async () => {
      const orig = globalThis.crypto?.randomUUID;
      if (globalThis.crypto) (globalThis.crypto as any).randomUUID = undefined;
      try {
        const userId = await getOrCreateUserId();
        expect(typeof userId).toBe('string');
      } finally {
        if (orig) (globalThis.crypto as any).randomUUID = orig;
      }
    });

    it('reuses cached anonymous userId', async () => {
      const id1 = await getOrCreateUserId();
      const id2 = await getOrCreateUserId();
      expect(id1).toBe(id2);
    });
  });

  describe('getSubscriptionState', () => {
    it('returns free plan by default', async () => {
      const state = await getSubscriptionState();
      expect(state.plan).toBe('free');
      expect(state.isPro).toBe(false);
    });

    it('returns pro plan when backend says isPro=true', async () => {
      (globalThis as any).fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ isPro: true, plan: 'pro', expiresAt: Date.now() + 86400000 }),
      });

      const state = await getSubscriptionState();
      expect(state.plan).toBe('pro');
      expect(state.isPro).toBe(true);
    });

    it('returns free plan when backend fetch fails', async () => {
      (globalThis as any).fetch.mockRejectedValue(new Error('Network error'));
      const state = await getSubscriptionState();
      expect(state.plan).toBe('free');
    });

    it('returns free plan when backend returns non-ok', async () => {
      (globalThis as any).fetch.mockResolvedValue({ ok: false, status: 500 });
      const state = await getSubscriptionState();
      expect(state.plan).toBe('free');
    });

    it('uses cached value when within 5 min window', async () => {
      await browser.storage.local.set({ subscriptionPlan: 'pro', subscriptionLastCheck: Date.now() });
      const state = await getSubscriptionState();
      expect(state.plan).toBe('pro');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('refreshes when cache is stale', async () => {
      await browser.storage.local.set({ subscriptionPlan: 'free', subscriptionLastCheck: Date.now() - 10 * 60 * 1000 });
      await getSubscriptionState();
      expect(fetch).toHaveBeenCalled();
    });

    it('returns a userId', async () => {
      const state = await getSubscriptionState();
      expect(state.userId).toBeDefined();
      expect(typeof state.userId).toBe('string');
    });

    it('sends authenticated userId to backend when logged in', async () => {
      const payload = { sub: 42, email: 'test@gmail.com', exp: Math.floor(Date.now() / 1000) + 3600 };
      const encoded = btoa(JSON.stringify(payload));
      const token = `header.${encoded}.signature`;
      vi.spyOn((globalThis as any).chrome.cookies, 'get').mockResolvedValueOnce({
        name: 'auth_token', value: token, domain: '.pixiaoli.cn', path: '/',
      });

      await getSubscriptionState();
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('userId=42'));
    });
  });

  // ─── AI Usage Tracking ─────────────────────────────────────────────────────

  describe('canClassify', () => {
    it('allows classification for free user with no prior usage', async () => {
      const result = await canClassify();
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(FREE_AI_CLASSIFY_LIMIT);
      expect(result.isPro).toBe(false);
    });

    it('disallows when free limit reached', async () => {
      for (let i = 0; i < FREE_AI_CLASSIFY_LIMIT; i++) {
        await incrementClassifyUsage();
      }
      const result = await canClassify();
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('allows unlimited for pro users', async () => {
      (globalThis as any).fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ isPro: true, plan: 'pro' }),
      });
      const result = await canClassify();
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(Infinity);
      expect(result.isPro).toBe(true);
    });

    it('tracks remaining correctly after partial usage', async () => {
      await incrementClassifyUsage();
      await incrementClassifyUsage();
      const result = await canClassify();
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(FREE_AI_CLASSIFY_LIMIT - 2);
    });
  });

  describe('canSearch', () => {
    it('allows search for free user with no prior usage', async () => {
      const result = await canSearch();
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(FREE_AI_SEARCH_LIMIT);
    });

    it('disallows when free limit reached', async () => {
      for (let i = 0; i < FREE_AI_SEARCH_LIMIT; i++) {
        await incrementSearchUsage();
      }
      const result = await canSearch();
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('allows unlimited for pro users', async () => {
      (globalThis as any).fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ isPro: true, plan: 'pro' }),
      });
      const result = await canSearch();
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(Infinity);
    });
  });

  describe('incrementClassifyUsage', () => {
    it('increments classification count', async () => {
      await incrementClassifyUsage();
      await incrementClassifyUsage();
      const summary = await getAIUsageSummary();
      expect(summary.classifications).toBe(2);
    });

    it('resets on new day', async () => {
      // Set usage for yesterday
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      await browser.storage.local.set({ 'tabmaster-ai-usage': { date: yesterday, classifications: 5, searches: 5 } });

      const result = await canClassify();
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(FREE_AI_CLASSIFY_LIMIT);
    });
  });

  describe('incrementSearchUsage', () => {
    it('increments search count', async () => {
      await incrementSearchUsage();
      const summary = await getAIUsageSummary();
      expect(summary.searches).toBe(1);
    });
  });

  describe('getAIUsageSummary', () => {
    it('returns correct counts for free user', async () => {
      await incrementClassifyUsage();
      await incrementSearchUsage();
      await incrementSearchUsage();

      const summary = await getAIUsageSummary();
      expect(summary.classifications).toBe(1);
      expect(summary.searches).toBe(2);
      expect(summary.classifyLimit).toBe(FREE_AI_CLASSIFY_LIMIT);
      expect(summary.searchLimit).toBe(FREE_AI_SEARCH_LIMIT);
      expect(summary.isPro).toBe(false);
    });

    it('returns unlimited for pro users', async () => {
      (globalThis as any).fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ isPro: true, plan: 'pro' }),
      });

      const summary = await getAIUsageSummary();
      expect(summary.classifyLimit).toBe(Infinity);
      expect(summary.searchLimit).toBe(Infinity);
      expect(summary.isPro).toBe(true);
    });
  });
});
