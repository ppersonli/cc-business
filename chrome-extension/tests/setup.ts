// Global setup for vitest
// Mock browser extension APIs

// Create a minimal browser mock
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
        if (key in this.data) {
          result[key] = this.data[key];
        }
      }
      return result;
    },
    async set(items: Record<string, any>) {
      Object.assign(this.data, items);
    },
    async remove(keys: string | string[]) {
      if (typeof keys === 'string') {
        delete this.data[keys];
      } else {
        for (const key of keys) {
          delete this.data[key];
        }
      }
    },
    async clear() {
      this.data = {};
    },
  },
  sync: {
    data: {} as Record<string, any>,
    async get(keys: string | string[]) {
      if (typeof keys === 'string') {
        if (keys in this.data) return { [keys]: this.data[keys] };
        return {};
      }
      const result: Record<string, any> = {};
      for (const key of keys) {
        if (key in this.data) {
          result[key] = this.data[key];
        }
      }
      return result;
    },
    async set(items: Record<string, any>) {
      Object.assign(this.data, items);
    },
    async remove(keys: string | string[]) {
      if (typeof keys === 'string') {
        delete this.data[keys];
      } else {
        for (const key of keys) {
          delete this.data[key];
        }
      }
    },
    async clear() {
      this.data = {};
    },
  },
};

// Mock browser global
(globalThis as any).browser = {
  storage: mockStorage,
  runtime: {
    onInstalled: { addListener: vi.fn() },
    onMessage: { addListener: vi.fn() },
    sendMessage: vi.fn(),
    openOptionsPage: vi.fn(),
  },
  tabs: {
    query: vi.fn().mockResolvedValue([]),
    sendMessage: vi.fn(),
  },
  contextMenus: {
    create: vi.fn(),
    onClicked: { addListener: vi.fn() },
  },
  notifications: {
    create: vi.fn(),
  },
  scripting: {
    executeScript: vi.fn(),
  },
  sidePanel: {
    setPanelBehavior: vi.fn().mockResolvedValue(undefined),
    open: vi.fn().mockResolvedValue(undefined),
  },
  commands: {
    onCommand: { addListener: vi.fn() },
  },
};

// Also set as chrome for compatibility
(globalThis as any).chrome = (globalThis as any).browser;
