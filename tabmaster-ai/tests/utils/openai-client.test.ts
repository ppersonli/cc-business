import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getApiKey, setApiKey } from '../../utils/openai-client';

// Mock chrome.storage.local
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

beforeEach(() => {
  vi.clearAllMocks();
  Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
  localStorage.clear();
  (globalThis as any).chrome = chromeMock;
});

afterEach(() => {
  delete (globalThis as any).chrome;
});

describe('getApiKey', () => {
  it('returns null when no key is stored', async () => {
    const key = await getApiKey();
    expect(key).toBeNull();
  });

  it('returns key from chrome.storage.local', async () => {
    mockStorage['openai_api_key'] = 'sk-test-123';
    const key = await getApiKey();
    expect(key).toBe('sk-test-123');
  });

  it('falls back to localStorage when chrome.storage is unavailable', async () => {
    delete (globalThis as any).chrome;
    localStorage.setItem('tabmaster_local_openai_api_key', JSON.stringify('sk-local-key'));
    const key = await getApiKey();
    expect(key).toBe('sk-local-key');
  });
});

describe('setApiKey', () => {
  it('stores key in chrome.storage.local', async () => {
    await setApiKey('sk-new-key');
    expect(chromeMock.storage.local.set).toHaveBeenCalledWith({ openai_api_key: 'sk-new-key' });
  });

  it('falls back to localStorage when chrome.storage is unavailable', async () => {
    delete (globalThis as any).chrome;
    await setApiKey('sk-local-save');
    expect(localStorage.getItem('tabmaster_local_openai_api_key')).toBe(JSON.stringify('sk-local-save'));
  });
});
