import { ref } from 'vue';
import { FREE_SNAPSHOT_LIMIT } from '~/utils/subscription';
import type { SnapshotTabItem } from '~/utils/tab-utils';

export interface Snapshot {
  id: string;
  name: string;
  createdAt: number;
  tabs: SnapshotTabItem[];
  windowId: number;
}

const STORAGE_KEY = 'tabmaster-snapshots';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useSnapshots() {
  const snapshots = ref<Snapshot[]>([]);

  async function getSnapshots(): Promise<Snapshot[]> {
    const data = await browser.storage.local.get(STORAGE_KEY);
    snapshots.value = (data[STORAGE_KEY] as Snapshot[]) ?? [];
    return snapshots.value;
  }

  async function saveSnapshot(name: string, tabs: SnapshotTabItem[], windowId: number): Promise<Snapshot> {
    const existing = await getSnapshots();
    if (existing.length >= FREE_SNAPSHOT_LIMIT) {
      throw new Error(`Snapshot limit reached: maximum ${FREE_SNAPSHOT_LIMIT} snapshots allowed`);
    }

    const snapshot: Snapshot = {
      id: generateId(),
      name,
      createdAt: Date.now(),
      tabs,
      windowId,
    };

    const updated = [...existing, snapshot];
    await browser.storage.local.set({ [STORAGE_KEY]: updated });
    snapshots.value = updated;
    return snapshot;
  }

  async function deleteSnapshot(id: string): Promise<void> {
    const existing = await getSnapshots();
    const updated = existing.filter(s => s.id !== id);
    await browser.storage.local.set({ [STORAGE_KEY]: updated });
    snapshots.value = updated;
  }

  async function restoreSnapshot(id: string): Promise<void> {
    const existing = await getSnapshots();
    const snapshot = existing.find(s => s.id === id);
    if (!snapshot) throw new Error(`Snapshot ${id} not found`);

    const urls = snapshot.tabs.map(t => t.url).filter(Boolean);
    if (urls.length > 0) {
      await chrome.windows.create({ urls });
    }
  }

  return { snapshots, getSnapshots, saveSnapshot, deleteSnapshot, restoreSnapshot };
}
