import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  activateFocusMode,
  deactivateFocusMode,
  getFocusState,
  getHiddenTabIds,
  buildFocusPrompt,
  parseFocusResponse,
  type FocusState,
  type FocusResult,
} from '../../utils/focus-mode';
import type { TabInfo } from '../../utils/tab-utils';

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
      remove: vi.fn(async (key: string) => {
        delete mockStorage[key];
      }),
    },
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
  (globalThis as any).chrome = chromeMock;
});

afterEach(() => {
  delete (globalThis as any).chrome;
});

const mockTabs: TabInfo[] = [
  { id: 1, title: 'React Docs', url: 'https://react.dev', pinned: false, windowId: 1, active: true },
  { id: 2, title: 'GitHub - my repo', url: 'https://github.com/me/repo', pinned: false, windowId: 1, active: false },
  { id: 3, title: 'YouTube - cat video', url: 'https://youtube.com/watch?v=cat', pinned: false, windowId: 1, active: false },
  { id: 4, title: 'Netflix', url: 'https://netflix.com/browse', pinned: false, windowId: 1, active: false },
  { id: 5, title: 'Stack Overflow - React hooks', url: 'https://stackoverflow.com/q/123', pinned: false, windowId: 1, active: false },
];

describe('getFocusState', () => {
  it('returns null when focus mode is not active', async () => {
    const state = await getFocusState();
    expect(state).toBeNull();
  });

  it('returns stored focus state', async () => {
    const stored: FocusState = {
      active: true,
      task: 'working on React',
      hiddenTabIds: [3, 4],
      activatedAt: Date.now(),
    };
    mockStorage['focus_state'] = stored;
    const state = await getFocusState();
    expect(state).not.toBeNull();
    expect(state!.task).toBe('working on React');
    expect(state!.hiddenTabIds).toEqual([3, 4]);
  });
});

describe('activateFocusMode', () => {
  it('stores focus state with hidden tab ids', async () => {
    const results: FocusResult[] = [
      { id: 1, relevant: true, reason: 'React docs' },
      { id: 2, relevant: true, reason: 'GitHub repo' },
      { id: 3, relevant: false, reason: 'Entertainment' },
      { id: 4, relevant: false, reason: 'Entertainment' },
      { id: 5, relevant: true, reason: 'React question' },
    ];
    const state = await activateFocusMode('working on React project', results, mockTabs);
    expect(state.active).toBe(true);
    expect(state.task).toBe('working on React project');
    expect(state.hiddenTabIds).toEqual([3, 4]);
    expect(state.activatedAt).toBeGreaterThan(0);
    expect(mockStorage['focus_state']).toEqual(state);
  });

  it('hides only tabs marked as not relevant', async () => {
    const results: FocusResult[] = [
      { id: 1, relevant: false, reason: 'Not related' },
      { id: 2, relevant: true, reason: 'Related' },
    ];
    const state = await activateFocusMode('task', results, mockTabs.slice(0, 2));
    expect(state.hiddenTabIds).toEqual([1]);
  });

  it('hides no tabs when all are relevant', async () => {
    const results: FocusResult[] = [
      { id: 1, relevant: true, reason: '' },
      { id: 2, relevant: true, reason: '' },
    ];
    const state = await activateFocusMode('task', results, mockTabs.slice(0, 2));
    expect(state.hiddenTabIds).toEqual([]);
  });
});

describe('deactivateFocusMode', () => {
  it('clears focus state from storage', async () => {
    mockStorage['focus_state'] = {
      active: true,
      task: 'React',
      hiddenTabIds: [3, 4],
      activatedAt: Date.now(),
    };
    await deactivateFocusMode();
    expect(mockStorage['focus_state']).toBeUndefined();
  });

  it('returns the previously hidden tab ids', async () => {
    mockStorage['focus_state'] = {
      active: true,
      task: 'React',
      hiddenTabIds: [3, 4],
      activatedAt: Date.now(),
    };
    const hiddenIds = await deactivateFocusMode();
    expect(hiddenIds).toEqual([3, 4]);
  });

  it('returns empty array when no focus state', async () => {
    const hiddenIds = await deactivateFocusMode();
    expect(hiddenIds).toEqual([]);
  });
});

describe('getHiddenTabIds', () => {
  it('returns empty set when not in focus mode', async () => {
    const hidden = await getHiddenTabIds();
    expect(hidden.size).toBe(0);
  });

  it('returns hidden tab ids as a set', async () => {
    mockStorage['focus_state'] = {
      active: true,
      task: 'React',
      hiddenTabIds: [3, 4],
      activatedAt: Date.now(),
    };
    const hidden = await getHiddenTabIds();
    expect(hidden.size).toBe(2);
    expect(hidden.has(3)).toBe(true);
    expect(hidden.has(4)).toBe(true);
  });

  it('returns empty set when focus mode is inactive', async () => {
    mockStorage['focus_state'] = {
      active: false,
      task: 'React',
      hiddenTabIds: [3, 4],
      activatedAt: Date.now(),
    };
    const hidden = await getHiddenTabIds();
    expect(hidden.size).toBe(0);
  });
});

describe('buildFocusPrompt', () => {
  it('includes task and tab info', () => {
    const prompt = buildFocusPrompt('working on React', mockTabs);
    expect(prompt).toContain('working on React');
    expect(prompt).toContain('React Docs');
    expect(prompt).toContain('YouTube');
  });

  it('requests JSON output', () => {
    const prompt = buildFocusPrompt('test', mockTabs);
    expect(prompt).toContain('JSON array');
  });
});

describe('parseFocusResponse', () => {
  it('parses valid JSON response', () => {
    const response = '[{"id": 1, "relevant": true, "reason": "React docs"}, {"id": 3, "relevant": false, "reason": "Entertainment"}]';
    const result = parseFocusResponse(response);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
    expect(result[0].relevant).toBe(true);
    expect(result[1].relevant).toBe(false);
  });

  it('handles markdown code fences', () => {
    const response = '```json\n[{"id": 1, "relevant": true, "reason": "ok"}]\n```';
    const result = parseFocusResponse(response);
    expect(result).toHaveLength(1);
  });

  it('returns empty array for invalid JSON', () => {
    const result = parseFocusResponse('not json');
    expect(result).toHaveLength(0);
  });

  it('coerces relevant to boolean', () => {
    const response = '[{"id": 1, "relevant": 1, "reason": ""}, {"id": 2, "relevant": 0, "reason": ""}]';
    const result = parseFocusResponse(response);
    expect(result[0].relevant).toBe(true);
    expect(result[1].relevant).toBe(false);
  });
});
