import { ref } from 'vue';
import {
  groupTabsByWindow,
  findDuplicateTabs,
  getPinnedTabs,
  filterTabsByCategory,
  isTabStale,
  type DuplicateGroup,
} from '~/utils/tab-utils';

export function useTabs() {
  const tabs = ref<chrome.tabs.Tab[]>([]);
  const loading = ref(false);

  async function getAllTabs(): Promise<chrome.tabs.Tab[]> {
    loading.value = true;
    try {
      const allTabs = await chrome.tabs.query({});
      tabs.value = allTabs;
      return allTabs;
    } finally {
      loading.value = false;
    }
  }

  async function activateTab(tabId: number, windowId?: number): Promise<void> {
    await chrome.tabs.update(tabId, { active: true });
    if (windowId !== undefined) {
      await chrome.windows.update(windowId, { focused: true });
    }
  }

  async function closeTab(tabId: number): Promise<void> {
    await chrome.tabs.remove(tabId);
    tabs.value = tabs.value.filter(t => t.id !== tabId);
  }

  async function closeDuplicateTabs(): Promise<number> {
    const allTabs = await getAllTabs();
    const dupes = findDuplicateTabs(allTabs);
    let closed = 0;
    for (const group of dupes) {
      // Keep the first (active or first) tab, close the rest
      const toClose = group.tabs.slice(1);
      for (const tab of toClose) {
        if (tab.id) {
          await closeTab(tab.id);
          closed++;
        }
      }
    }
    return closed;
  }

  async function closeStaleTabs(staleMs = 24 * 60 * 60 * 1000): Promise<number> {
    const allTabs = await getAllTabs();
    let closed = 0;
    for (const tab of allTabs) {
      if (tab.id && !tab.pinned && !tab.active && tab.lastAccessed && isTabStale(tab.lastAccessed, staleMs)) {
        await closeTab(tab.id);
        closed++;
      }
    }
    return closed;
  }

  async function closeAllExceptPinned(): Promise<number> {
    const allTabs = await getAllTabs();
    const toClose = allTabs.filter(t => !t.pinned && t.id);
    for (const tab of toClose) {
      if (tab.id) await closeTab(tab.id);
    }
    return toClose.length;
  }

  return {
    tabs,
    loading,
    getAllTabs,
    activateTab,
    closeTab,
    closeDuplicateTabs,
    closeStaleTabs,
    closeAllExceptPinned,
    groupTabsByWindow,
    findDuplicateTabs: () => findDuplicateTabs(tabs.value),
    getPinnedTabs: () => getPinnedTabs(tabs.value),
    filterTabsByCategory: (category: string, classifications: Map<number, string>) =>
      filterTabsByCategory(tabs.value, category, classifications),
  };
}
