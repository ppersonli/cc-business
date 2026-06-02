import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getSubscriptionState,
  getDailyUsage,
  canUse,
  incrementUsage,
  refreshSubscription,
} from '~/utils/subscription';

describe('utils/subscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).browser.storage.local.data = {};
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ isPro: false }),
    }));
  });

  describe('getSubscriptionState', () => {
    it('returns free plan when backend says isPro=false', async () => {
      const state = await getSubscriptionState();
      expect(state.plan).toBe('free');
      expect(state.isPro).toBe(false);
    });

    it('returns pro plan when backend says isPro=true', async () => {
      (globalThis as any).fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ isPro: true, expiresAt: Date.now() + 86400000 }),
      });

      const state = await getSubscriptionState();
      expect(state.plan).toBe('pro');
      expect(state.isPro).toBe(true);
      expect(state.expiresAt).toBeDefined();
    });

    it('returns free plan when backend fetch fails', async () => {
      (globalThis as any).fetch.mockRejectedValue(new Error('Network error'));

      const state = await getSubscriptionState();
      expect(state.plan).toBe('free');
      expect(state.isPro).toBe(false);
    });

    it('returns free plan when backend returns non-ok', async () => {
      (globalThis as any).fetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      const state = await getSubscriptionState();
      expect(state.plan).toBe('free');
    });

    it('caches subscription state in storage', async () => {
      await getSubscriptionState();

      const stored = await browser.storage.local.get(['subscriptionPlan', 'subscriptionLastCheck']);
      expect(stored.subscriptionPlan).toBe('free');
      expect(stored.subscriptionLastCheck).toBeDefined();
    });

    it('uses cached value when within 5 min window', async () => {
      await browser.storage.local.set({
        subscriptionPlan: 'pro',
        subscriptionLastCheck: Date.now(),
      });

      const state = await getSubscriptionState();
      expect(state.plan).toBe('pro');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('refreshes when cache is stale', async () => {
      await browser.storage.local.set({
        subscriptionPlan: 'free',
        subscriptionLastCheck: Date.now() - 10 * 60 * 1000,
      });

      await getSubscriptionState();
      expect(fetch).toHaveBeenCalled();
    });

    it('returns a userId', async () => {
      const state = await getSubscriptionState();
      expect(state.userId).toBeDefined();
      expect(typeof state.userId).toBe('string');
    });

    it('generates a userId on first call and reuses it', async () => {
      const state1 = await getSubscriptionState();
      const state2 = await getSubscriptionState();
      expect(state1.userId).toBe(state2.userId);
    });

    it('generates userId without crypto.randomUUID when unavailable', async () => {
      const orig = globalThis.crypto?.randomUUID;
      if (globalThis.crypto) {
        (globalThis.crypto as any).randomUUID = undefined;
      }
      try {
        const state = await getSubscriptionState();
        expect(state.userId).toBeDefined();
        expect(typeof state.userId).toBe('string');
      } finally {
        if (orig) (globalThis.crypto as any).randomUUID = orig;
      }
    });
  });

  describe('getDailyUsage', () => {
    it('returns 0 count for free user on new day', async () => {
      const usage = await getDailyUsage();
      expect(usage.count).toBe(0);
      expect(usage.limit).toBe(5);
      expect(usage.isPro).toBe(false);
    });

    it('handles missing usageCount in storage (undefined)', async () => {
      await browser.storage.local.set({ usageDate: new Date().toISOString().slice(0, 10) });
      const usage = await getDailyUsage();
      expect(usage.count).toBe(0);
    });

    it('returns unlimited for pro user', async () => {
      (globalThis as any).fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ isPro: true }),
      });

      const usage = await getDailyUsage();
      expect(usage.limit).toBe(Infinity);
      expect(usage.isPro).toBe(true);
    });

    it('returns correct count after incrementing', async () => {
      await incrementUsage();
      await incrementUsage();

      const usage = await getDailyUsage();
      expect(usage.count).toBe(2);
      expect(usage.limit).toBe(5);
    });

    it('resets count on new day', async () => {
      await browser.storage.local.set({
        usageDate: '2020-01-01',
        usageCount: 5,
      });

      const usage = await getDailyUsage();
      expect(usage.count).toBe(0);
    });
  });

  describe('canUse', () => {
    it('allows usage when count is below limit', async () => {
      const result = await canUse();
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(5);
    });

    it('disallows usage when limit is reached', async () => {
      for (let i = 0; i < 5; i++) await incrementUsage();

      const result = await canUse();
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('allows unlimited for pro users', async () => {
      (globalThis as any).fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ isPro: true }),
      });

      const result = await canUse();
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(Infinity);
      expect(result.isPro).toBe(true);
    });

    it('tracks remaining correctly after partial usage', async () => {
      await incrementUsage();

      const result = await canUse();
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });
  });

  describe('incrementUsage', () => {
    it('sets count to 1 on first call of the day', async () => {
      await incrementUsage();
      const data = await browser.storage.local.get('usageCount');
      expect(data.usageCount).toBe(1);
    });

    it('increments count on subsequent calls', async () => {
      await incrementUsage();
      await incrementUsage();
      await incrementUsage();

      const data = await browser.storage.local.get('usageCount');
      expect(data.usageCount).toBe(3);
    });

    it('sets today as usageDate', async () => {
      await incrementUsage();
      const data = await browser.storage.local.get('usageDate');
      expect(data.usageDate).toBe(new Date().toISOString().slice(0, 10));
    });

    it('handles missing usageCount when date matches today', async () => {
      const today = new Date().toISOString().slice(0, 10);
      await browser.storage.local.set({ usageDate: today });
      await incrementUsage();
      const data = await browser.storage.local.get('usageCount');
      expect(data.usageCount).toBe(1);
    });
  });

  describe('refreshSubscription', () => {
    it('clears cache and fetches fresh data', async () => {
      await browser.storage.local.set({
        subscriptionPlan: 'pro',
        subscriptionLastCheck: Date.now(),
      });

      (globalThis as any).fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ isPro: false }),
      });

      const state = await refreshSubscription();
      expect(state.isPro).toBe(false);
      expect(fetch).toHaveBeenCalled();
    });
  });
});
