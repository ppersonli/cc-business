import { vi, beforeEach } from 'vitest';

// In-memory storage mock
const storageData: Record<string, any> = {};

const mockStorage = {
  get: vi.fn(async (keys?: string | string[] | null) => {
    if (keys == null) return { ...storageData };
    const keyList = Array.isArray(keys) ? keys : [keys];
    const result: Record<string, any> = {};
    for (const key of keyList) {
      if (key in storageData) result[key] = storageData[key];
    }
    return result;
  }),
  set: vi.fn(async (items: Record<string, any>) => {
    Object.assign(storageData, items);
  }),
  remove: vi.fn(async (keys: string | string[]) => {
    const keyList = Array.isArray(keys) ? keys : [keys];
    for (const key of keyList) delete storageData[key];
  }),
  clear: vi.fn(async () => {
    for (const key of Object.keys(storageData)) delete storageData[key];
  }),
};

// browser global mock
vi.stubGlobal('browser', {
  storage: {
    local: mockStorage,
    sync: mockStorage,
  },
  runtime: {
    sendMessage: vi.fn(),
    onMessage: { addListener: vi.fn(), removeListener: vi.fn() },
    getURL: vi.fn((path: string) => `chrome-extension://test-id/${path}`),
  },
  tabs: {
    query: vi.fn(async () => []),
    sendMessage: vi.fn(),
  },
});

// chrome global mock
vi.stubGlobal('chrome', {
  storage: {
    local: mockStorage,
  },
});

beforeEach(() => {
  // Clear storage between tests
  for (const key of Object.keys(storageData)) delete storageData[key];
  vi.clearAllMocks();
});
