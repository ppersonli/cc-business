import { vi } from 'vitest';

// In-memory storage mock
const storage: Record<string, any> = {};

const storageMock = {
  get: vi.fn(async (keys?: string | string[] | null) => {
    if (!keys) return { ...storage };
    if (typeof keys === 'string') return { [keys]: storage[keys] };
    const result: Record<string, any> = {};
    for (const key of keys) {
      if (key in storage) result[key] = storage[key];
    }
    return result;
  }),
  set: vi.fn(async (items: Record<string, any>) => {
    Object.assign(storage, items);
  }),
  remove: vi.fn(async (keys: string | string[]) => {
    const keyList = typeof keys === 'string' ? [keys] : keys;
    for (const key of keyList) delete storage[key];
  }),
  clear: vi.fn(async () => {
    for (const key of Object.keys(storage)) delete storage[key];
  }),
};

// Cookie mock
const cookies: Record<string, string> = {};

const cookiesMock = {
  get: vi.fn(async (details: { url: string; name: string }) => {
    const value = cookies[`${details.url}:${details.name}`];
    return value ? { value, name: details.name } : null;
  }),
};

// Management mock
const managementMock = {
  getAll: vi.fn(async () => [
    {
      id: 'test-ext-1',
      name: 'Test Extension',
      description: 'A test extension',
      version: '1.0.0',
      icons: [{ size: 128, url: 'chrome-extension://test/icon.png' }],
      enabled: true,
      type: 'extension',
      mayDisable: true,
    },
    {
      id: chrome.runtime.id,
      name: 'ExtensionShield',
      description: 'Self',
      version: '0.1.0',
      icons: [],
      enabled: true,
      type: 'extension',
      mayDisable: true,
    },
  ]),
  get: vi.fn(async (id: string) => ({
    id,
    name: 'Test Extension',
    description: 'A test extension',
    version: '1.0.0',
    type: 'extension',
    enabled: true,
  })),
};

// Runtime mock
const runtimeMock = {
  id: 'extension-shield-test-id',
  sendMessage: vi.fn(),
  onMessage: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
};

// SidePanel mock
const sidePanelMock = {
  setPanelBehavior: vi.fn(async () => {}),
  open: vi.fn(async () => {}),
};

// Assign to globals
globalThis.browser = {
  storage: { local: storageMock },
  runtime: runtimeMock,
} as any;

globalThis.chrome = {
  ...globalThis.chrome,
  cookies: cookiesMock as any,
  management: managementMock as any,
  runtime: runtimeMock as any,
  sidePanel: sidePanelMock as any,
} as any;

// Expose test helpers
(globalThis as any).__testStorage = storage;
(globalThis as any).__testCookies = cookies;
(globalThis as any).__testMocks = {
  storage: storageMock,
  cookies: cookiesMock,
  management: managementMock,
  runtime: runtimeMock,
  sidePanel: sidePanelMock,
};
