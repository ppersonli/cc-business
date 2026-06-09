import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSnapshots } from '~/composables/useSnapshots';

describe('composables/useSnapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).browser.storage.local.data = {};
  });

  const sampleTabs = [
    { url: 'https://a.com', title: 'A', pinned: false },
    { url: 'https://b.com', title: 'B', pinned: true },
  ];

  it('saveSnapshot stores snapshot in chrome.storage.local', async () => {
    const { saveSnapshot, getSnapshots } = useSnapshots();
    await saveSnapshot('My Snapshot', sampleTabs as any, 1);

    const snapshots = await getSnapshots();
    expect(snapshots).toHaveLength(1);
    expect(snapshots[0].name).toBe('My Snapshot');
    expect(snapshots[0].tabs).toHaveLength(2);
  });

  it('saveSnapshot generates unique id', async () => {
    const { saveSnapshot, getSnapshots } = useSnapshots();
    await saveSnapshot('Snap 1', sampleTabs as any, 1);
    await saveSnapshot('Snap 2', sampleTabs as any, 1);

    const snapshots = await getSnapshots();
    expect(snapshots[0].id).not.toBe(snapshots[1].id);
  });

  it('deleteSnapshot removes a snapshot by id', async () => {
    const { saveSnapshot, getSnapshots, deleteSnapshot } = useSnapshots();
    await saveSnapshot('To Delete', sampleTabs as any, 1);

    const snapshots = await getSnapshots();
    expect(snapshots).toHaveLength(1);

    await deleteSnapshot(snapshots[0].id);
    const after = await getSnapshots();
    expect(after).toHaveLength(0);
  });

  it('getSnapshots returns empty array when none exist', async () => {
    const { getSnapshots } = useSnapshots();
    const snapshots = await getSnapshots();
    expect(snapshots).toEqual([]);
  });

  it('restoreSnapshot calls chrome.windows.create with urls', async () => {
    (globalThis as any).chrome.windows = { create: vi.fn().mockResolvedValue({ id: 1 }) };

    const { saveSnapshot, getSnapshots, restoreSnapshot } = useSnapshots();
    await saveSnapshot('Restore Me', sampleTabs as any, 1);

    const snapshots = await getSnapshots();
    await restoreSnapshot(snapshots[0].id);

    expect(chrome.windows.create).toHaveBeenCalledWith({
      urls: ['https://a.com', 'https://b.com'],
    });
  });

  it('saveSnapshot respects 5 snapshot limit for free users', async () => {
    const { saveSnapshot, getSnapshots } = useSnapshots();
    for (let i = 0; i < 5; i++) {
      await saveSnapshot(`Snap ${i}`, sampleTabs as any, 1);
    }

    await expect(saveSnapshot('Over Limit', sampleTabs as any, 1)).rejects.toThrow('limit');
  });
});
