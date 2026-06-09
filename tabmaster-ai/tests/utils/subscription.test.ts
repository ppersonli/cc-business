import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAuthCookie,
  getOrCreateUserId,
  getSubscriptionState,
} from '~/utils/subscription';

describe('utils/subscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).browser.storage.local.data = {};
    (globalThis as any).chrome.cookies.data = {};
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ isPro: false, plan: 'free' }),
    }));
  });

  describe('getAuthCookie', () => {
    it('returns null when no auth cookie exists', async () => {
      const result = await getAuthCookie();
      expect(result).toBeNull();
    });

    it('parses a valid JWT cookie', async () => {
      const payload = { sub: 42, email: 'test@gmail.com', exp: Math.floor(Date.now() / 1000) + 3600 };
      const encoded = btoa(JSON.stringify(payload));
      (globalThis as any).chrome.cookies.data = { auth_token: `header.${encoded}.sig` };

      const result = await getAuthCookie();
      expect(result).toEqual({ userId: '42', email: 'test@gmail.com' });
    });

    it('returns null for expired JWT', async () => {
      const payload = { sub: 42, email: 'test@gmail.com', exp: Math.floor(Date.now() / 1000) - 3600 };
      const encoded = btoa(JSON.stringify(payload));
      (globalThis as any).chrome.cookies.data = { auth_token: `header.${encoded}.sig` };

      const result = await getAuthCookie();
      expect(result).toBeNull();
    });

    it('returns null for malformed JWT', async () => {
      (globalThis as any).chrome.cookies.data = { auth_token: 'not-a-jwt' };
      const result = await getAuthCookie();
      expect(result).toBeNull();
    });
  });

  describe('getOrCreateUserId', () => {
    it('returns authenticated userId when cookie is present', async () => {
      const payload = { sub: 42, email: 'test@gmail.com', exp: Math.floor(Date.now() / 1000) + 3600 };
      const encoded = btoa(JSON.stringify(payload));
      (globalThis as any).chrome.cookies.data = { auth_token: `header.${encoded}.sig` };

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

    it('uses cached value when within 5 min window', async () => {
      await browser.storage.local.set({ subscriptionPlan: 'pro', subscriptionLastCheck: Date.now() });
      const state = await getSubscriptionState();
      expect(state.plan).toBe('pro');
      expect(fetch).not.toHaveBeenCalled();
    });
  });
});
