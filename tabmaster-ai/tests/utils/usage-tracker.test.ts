import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getUsage,
  canUseFeature,
  incrementUsage,
  getUsageSummary,
  FREE_LIMITS,
} from '../../utils/usage-tracker';

const mockStorage: Record<string, any> = {};
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
    },
  },
};

const today = new Date().toISOString().slice(0, 10);

beforeEach(() => {
  vi.clearAllMocks();
  Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
  (globalThis as any).chrome = chromeMock;
});

afterEach(() => {
  delete (globalThis as any).chrome;
});

describe('FREE_LIMITS', () => {
  it('has correct limits', () => {
    expect(FREE_LIMITS.classification).toBe(5);
    expect(FREE_LIMITS.search).toBe(10);
  });
});

describe('getUsage', () => {
  it('returns fresh data when no usage exists', async () => {
    const usage = await getUsage();
    expect(usage.classificationCount).toBe(0);
    expect(usage.searchCount).toBe(0);
    expect(usage.date).toBe(today);
  });

  it('returns existing usage for today', async () => {
    mockStorage['ai_usage'] = { classificationCount: 3, searchCount: 7, date: today };
    const usage = await getUsage();
    expect(usage.classificationCount).toBe(3);
    expect(usage.searchCount).toBe(7);
  });

  it('resets counts when date has changed', async () => {
    mockStorage['ai_usage'] = { classificationCount: 5, searchCount: 10, date: '2020-01-01' };
    const usage = await getUsage();
    expect(usage.classificationCount).toBe(0);
    expect(usage.searchCount).toBe(0);
    expect(usage.date).toBe(today);
  });

  it('falls back to localStorage when chrome.storage is unavailable', async () => {
    delete (globalThis as any).chrome;
    const data = { classificationCount: 2, searchCount: 4, date: today };
    localStorage.setItem('tabmaster_local_ai_usage', JSON.stringify(data));
    const usage = await getUsage();
    expect(usage.classificationCount).toBe(2);
    expect(usage.searchCount).toBe(4);
  });
});

describe('canUseFeature', () => {
  it('allows Pro users unlimited access', async () => {
    const result = await canUseFeature('classification', true);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(Infinity);
  });

  it('allows free users under the limit', async () => {
    mockStorage['ai_usage'] = { classificationCount: 2, searchCount: 0, date: today };
    const result = await canUseFeature('classification', false);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(3);
  });

  it('blocks free users at the limit', async () => {
    mockStorage['ai_usage'] = { classificationCount: 5, searchCount: 0, date: today };
    const result = await canUseFeature('classification', false);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('tracks search usage separately', async () => {
    mockStorage['ai_usage'] = { classificationCount: 0, searchCount: 9, date: today };
    const result = await canUseFeature('search', false);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });
});

describe('incrementUsage', () => {
  it('increments classification count', async () => {
    mockStorage['ai_usage'] = { classificationCount: 1, searchCount: 3, date: today };
    await incrementUsage('classification');
    expect(mockStorage['ai_usage'].classificationCount).toBe(2);
    expect(mockStorage['ai_usage'].searchCount).toBe(3);
  });

  it('increments search count', async () => {
    mockStorage['ai_usage'] = { classificationCount: 1, searchCount: 3, date: today };
    await incrementUsage('search');
    expect(mockStorage['ai_usage'].classificationCount).toBe(1);
    expect(mockStorage['ai_usage'].searchCount).toBe(4);
  });

  it('starts from zero on fresh day', async () => {
    await incrementUsage('classification');
    expect(mockStorage['ai_usage'].classificationCount).toBe(1);
    expect(mockStorage['ai_usage'].searchCount).toBe(0);
  });
});

describe('getUsageSummary', () => {
  it('returns unlimited for Pro users', async () => {
    const summary = await getUsageSummary(true);
    expect(summary.classification.limit).toBe('unlimited');
    expect(summary.search.limit).toBe('unlimited');
  });

  it('returns counts and limits for free users', async () => {
    mockStorage['ai_usage'] = { classificationCount: 2, searchCount: 5, date: today };
    const summary = await getUsageSummary(false);
    expect(summary.classification).toEqual({ used: 2, limit: 5 });
    expect(summary.search).toEqual({ used: 5, limit: 10 });
  });
});
