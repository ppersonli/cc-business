import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  saveWorkflow,
  getWorkflows,
  deleteWorkflow,
  executeWorkflow,
  MAX_FREE_WORKFLOWS,
  type Workflow,
} from '../../utils/workflow-automation';

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
  tabs: {
    create: vi.fn(async (opts: { url: string }) => ({ id: 99, url: opts.url })),
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

describe('MAX_FREE_WORKFLOWS', () => {
  it('is 3', () => {
    expect(MAX_FREE_WORKFLOWS).toBe(3);
  });
});

describe('getWorkflows', () => {
  it('returns empty array when no workflows stored', async () => {
    const workflows = await getWorkflows();
    expect(workflows).toEqual([]);
  });

  it('returns stored workflows', async () => {
    const stored: Workflow[] = [
      { id: 'w1', name: 'Morning', tabs: [{ url: 'https://gmail.com', title: 'Gmail' }], createdAt: Date.now() },
    ];
    mockStorage['workflows'] = stored;
    const workflows = await getWorkflows();
    expect(workflows).toHaveLength(1);
    expect(workflows[0].name).toBe('Morning');
  });
});

describe('saveWorkflow', () => {
  it('saves a new workflow and returns it', async () => {
    const result = await saveWorkflow({ name: 'Morning', tabs: [{ url: 'https://gmail.com', title: 'Gmail' }] }, false);
    expect(result).toBeTruthy();
    expect(result!.name).toBe('Morning');
    expect(result!.id).toBeTruthy();
    expect(result!.createdAt).toBeGreaterThan(0);
  });

  it('persists to storage', async () => {
    await saveWorkflow({ name: 'Morning', tabs: [{ url: 'https://gmail.com', title: 'Gmail' }] }, false);
    expect(mockStorage['workflows']).toHaveLength(1);
  });

  it('returns null when free user hits limit', async () => {
    // Fill up to the limit
    mockStorage['workflows'] = [
      { id: 'w1', name: 'A', tabs: [], createdAt: 1 },
      { id: 'w2', name: 'B', tabs: [], createdAt: 2 },
      { id: 'w3', name: 'C', tabs: [], createdAt: 3 },
    ];
    const result = await saveWorkflow({ name: 'D', tabs: [] }, false);
    expect(result).toBeNull();
  });

  it('allows Pro user unlimited workflows', async () => {
    mockStorage['workflows'] = [
      { id: 'w1', name: 'A', tabs: [], createdAt: 1 },
      { id: 'w2', name: 'B', tabs: [], createdAt: 2 },
      { id: 'w3', name: 'C', tabs: [], createdAt: 3 },
    ];
    const result = await saveWorkflow({ name: 'D', tabs: [] }, true);
    expect(result).toBeTruthy();
    expect(result!.name).toBe('D');
  });

  it('updates an existing workflow by id', async () => {
    mockStorage['workflows'] = [
      { id: 'w1', name: 'Old', tabs: [], createdAt: 1 },
    ];
    const result = await saveWorkflow({ id: 'w1', name: 'Updated', tabs: [{ url: 'https://x.com', title: 'X' }] }, false);
    expect(result).toBeTruthy();
    expect(result!.name).toBe('Updated');
    expect(mockStorage['workflows']).toHaveLength(1);
    expect(mockStorage['workflows'][0].name).toBe('Updated');
  });
});

describe('deleteWorkflow', () => {
  it('removes a workflow by id', async () => {
    mockStorage['workflows'] = [
      { id: 'w1', name: 'A', tabs: [], createdAt: 1 },
      { id: 'w2', name: 'B', tabs: [], createdAt: 2 },
    ];
    await deleteWorkflow('w1');
    expect(mockStorage['workflows']).toHaveLength(1);
    expect(mockStorage['workflows'][0].id).toBe('w2');
  });

  it('does nothing if id not found', async () => {
    mockStorage['workflows'] = [
      { id: 'w1', name: 'A', tabs: [], createdAt: 1 },
    ];
    await deleteWorkflow('w99');
    expect(mockStorage['workflows']).toHaveLength(1);
  });
});

describe('executeWorkflow', () => {
  it('opens all tabs in the workflow', async () => {
    const workflow: Workflow = {
      id: 'w1',
      name: 'Morning',
      tabs: [
        { url: 'https://gmail.com', title: 'Gmail' },
        { url: 'https://github.com', title: 'GitHub' },
      ],
      createdAt: Date.now(),
    };
    await executeWorkflow(workflow);
    expect(chromeMock.tabs.create).toHaveBeenCalledTimes(2);
    expect(chromeMock.tabs.create).toHaveBeenCalledWith({ url: 'https://gmail.com' });
    expect(chromeMock.tabs.create).toHaveBeenCalledWith({ url: 'https://github.com' });
  });

  it('does nothing for empty workflow', async () => {
    const workflow: Workflow = { id: 'w1', name: 'Empty', tabs: [], createdAt: Date.now() };
    await executeWorkflow(workflow);
    expect(chromeMock.tabs.create).not.toHaveBeenCalled();
  });
});
