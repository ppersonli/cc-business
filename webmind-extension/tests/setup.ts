import { beforeEach, vi } from 'vitest';

// In-memory storage mock
const storageData: Record<string, any> = {};

const mockStorage = {
  get: vi.fn(async (keys: string | string[] | null) => {
    if (keys === null) return { ...storageData };
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
    for (const key of keyList) {
      delete storageData[key];
    }
  }),
  clear: vi.fn(async () => {
    Object.keys(storageData).forEach((k) => delete storageData[k]);
  }),
};

// Mock chrome global
(globalThis as any).chrome = {
  storage: { local: mockStorage },
  runtime: {
    sendMessage: vi.fn(),
    onMessage: { addListener: vi.fn(), removeListener: vi.fn() },
  },
  contextMenus: {
    create: vi.fn(),
    removeAll: vi.fn(),
    onClicked: { addListener: vi.fn() },
  },
  tabs: {
    sendMessage: vi.fn(),
    query: vi.fn(async () => []),
  },
};

// Reset storage before each test
beforeEach(() => {
  vi.clearAllMocks();
  Object.keys(storageData).forEach((k) => delete storageData[k]);
});
