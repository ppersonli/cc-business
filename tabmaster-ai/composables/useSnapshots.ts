/**
 * useSnapshots — Save and restore tab snapshots.
 */

import { ref, onMounted } from 'vue';
import type { Snapshot, TabInfo } from '../utils/tab-utils';
import { createSnapshot } from '../utils/tab-utils';
import { storageGet, storageSet } from './useStorage';

const SNAPSHOTS_KEY = 'snapshots';
const MAX_FREE_SNAPSHOTS = 5;
const MAX_PRO_SNAPSHOTS = Infinity;

export function useSnapshots() {
  const snapshots = ref<Snapshot[]>([]);
  const loading = ref(false);

  async function loadSnapshots(): Promise<Snapshot[]> {
    snapshots.value = await storageGet<Snapshot[]>(SNAPSHOTS_KEY, []);
    return snapshots.value;
  }

  async function saveSnapshot(name: string, tabs: TabInfo[], windowId: number, isPro: boolean): Promise<Snapshot | null> {
    const limit = isPro ? MAX_PRO_SNAPSHOTS : MAX_FREE_SNAPSHOTS;
    if (snapshots.value.length >= limit) {
      return null; // At limit
    }

    const snapshot = createSnapshot(name, tabs, windowId);
    snapshots.value = [snapshot, ...snapshots.value];
    await storageSet(SNAPSHOTS_KEY, snapshots.value);
    return snapshot;
  }

  async function deleteSnapshot(id: string): Promise<void> {
    snapshots.value = snapshots.value.filter(s => s.id !== id);
    await storageSet(SNAPSHOTS_KEY, snapshots.value);
  }

  async function renameSnapshot(id: string, newName: string): Promise<void> {
    const snapshot = snapshots.value.find(s => s.id === id);
    if (snapshot) {
      snapshot.name = newName;
      await storageSet(SNAPSHOTS_KEY, snapshots.value);
    }
  }

  /**
   * Restore a snapshot by opening all its tabs.
   */
  async function restoreSnapshot(snapshot: Snapshot): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.tabs) return;

    // Open all tabs from the snapshot
    const urls = snapshot.tabs.map(t => t.url).filter(Boolean);
    if (urls.length === 0) return;

    // Create a new window with the first tab, then add the rest
    await chrome.windows.create({ url: urls[0], focused: true });
    
    for (let i = 1; i < urls.length; i++) {
      await chrome.tabs.create({ url: urls[i], active: false });
    }
  }

  onMounted(loadSnapshots);

  return {
    snapshots,
    loading,
    loadSnapshots,
    saveSnapshot,
    deleteSnapshot,
    renameSnapshot,
    restoreSnapshot,
    MAX_FREE_SNAPSHOTS,
  };
}
