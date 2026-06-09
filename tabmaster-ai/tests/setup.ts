// Global setup for vitest — mock browser extension APIs

const mockStorage = {
  local: {
    data: {} as Record<string, any>,
    async get(keys: string | string[]) {
      if (typeof keys === 'string') {
        if (keys in this.data) return { [keys]: this.data[keys] };
        return {};
      }
      const result: Record<string, any> = {};
      for (const key of keys) {
        if (key in this.data) result[key] = this.data[key];
      }
      return result;
    },
    async set(items: Record<string, any>) { Object.assign(this.data, items); },
    async remove(keys: string | string[]) {
      if (typeof keys === 'string') { delete this.data[keys]; }
      else { for (const key of keys) delete this.data[key]; }
    },
    async clear() { this.data = {}; },
  },
};

const mockCookies = {
  data: {} as Record<string, string>,
  async get(details: { url: string; name: string }) {
    const value = mockCookies.data[details.name];
    if (value !== undefined) return { name: details.name, value, domain: '.pixiaoli.cn', path: '/' };
    return null;
  },
};

const mockTabs = {
  query: async () => [],
  get: async (id: number) => ({ id, title: 'Test Tab', url: 'https://example.com' }),
  remove: async () => {},
  update: async () => {},
  onActivated: { addListener: vi.fn() },
  onRemoved: { addListener: vi.fn() },
  onUpdated: { addListener: vi.fn() },
};

(globalThis as any).browser = {
  storage: mockStorage,
  runtime: {
    onInstalled: { addListener: vi.fn() },
    onMessage: { addListener: vi.fn() },
    sendMessage: vi.fn(),
    openOptionsPage: vi.fn(),
  },
  tabs: mockTabs,
  sidePanel: {
    setPanelBehavior: vi.fn().mockResolvedValue(undefined),
    open: vi.fn().mockResolvedValue(undefined),
  },
  commands: {
    onCommand: { addListener: vi.fn() },
  },
};

(globalThis as any).chrome = {
  ...(globalThis as any).browser,
  cookies: mockCookies,
  tabs: mockTabs,
  windows: {
    create: async () => ({ id: 1 }),
  },
};
