/**
 * useTabs — Tab CRUD operations using Chrome Tabs API.
 */

import { ref, onMounted } from 'vue';
import type { TabInfo } from '../utils/tab-utils';
import { sortTabs } from '../utils/tab-utils';

function isChromeApiAvailable(): boolean {
  return typeof chrome !== 'undefined' && !!chrome.tabs;
}

export function useTabs() {
  const tabs = ref<TabInfo[]>([]);
  const activeTabId = ref<number | null>(null);
  const loading = ref(false);

  async function refreshTabs(): Promise<TabInfo[]> {
    loading.value = true;
    try {
      if (!isChromeApiAvailable()) {
        // Mock data for testing
        tabs.value = getMockTabs();
        return tabs.value;
      }

      const chromeTabs = await chrome.tabs.query({});
      const result: TabInfo[] = chromeTabs
        .filter((t): t is chrome.tabs.Tab & { id: number } => t.id !== undefined)
        .map(t => ({
          id: t.id,
          title: t.title || 'Untitled',
          url: t.url || '',
          favIconUrl: t.favIconUrl,
          pinned: t.pinned,
          windowId: t.windowId,
          active: t.active || false,
          groupId: t.groupId,
        }));

      tabs.value = sortTabs(result);
      activeTabId.value = result.find(t => t.active)?.id ?? null;
      return tabs.value;
    } finally {
      loading.value = false;
    }
  }

  async function activateTab(tabId: number): Promise<void> {
    if (!isChromeApiAvailable()) return;
    await chrome.tabs.update(tabId, { active: true });
    const win = await chrome.tabs.get(tabId);
    if (win.windowId) {
      await chrome.windows.update(win.windowId, { focused: true });
    }
  }

  async function closeTab(tabId: number): Promise<void> {
    if (!isChromeApiAvailable()) return;
    await chrome.tabs.remove(tabId);
    await refreshTabs();
  }

  async function closeTabs(tabIds: number[]): Promise<void> {
    if (!isChromeApiAvailable()) return;
    await chrome.tabs.remove(tabIds);
    await refreshTabs();
  }

  async function pinTab(tabId: number, pinned: boolean): Promise<void> {
    if (!isChromeApiAvailable()) return;
    await chrome.tabs.update(tabId, { pinned });
    await refreshTabs();
  }

  onMounted(() => {
    refreshTabs();

    // Listen for tab changes
    if (isChromeApiAvailable()) {
      chrome.tabs.onCreated.addListener(refreshTabs);
      chrome.tabs.onRemoved.addListener(refreshTabs);
      chrome.tabs.onUpdated.addListener((_, changeInfo) => {
        if (changeInfo.title || changeInfo.url) refreshTabs();
      });
      chrome.tabs.onActivated.addListener(({ tabId }) => {
        activeTabId.value = tabId;
      });
    }
  });

  return {
    tabs,
    activeTabId,
    loading,
    refreshTabs,
    activateTab,
    closeTab,
    closeTabs,
    pinTab,
  };
}

function getMockTabs(): TabInfo[] {
  return [
    { id: 1, title: 'React Documentation', url: 'https://react.dev', pinned: true, windowId: 1, active: true },
    { id: 2, title: 'TypeScript Handbook', url: 'https://typescriptlang.org/docs', pinned: false, windowId: 1, active: false },
    { id: 3, title: 'GitHub - tabmaster-ai', url: 'https://github.com/user/tabmaster-ai', pinned: false, windowId: 1, active: false },
    { id: 4, title: 'Twitter / Home', url: 'https://twitter.com/home', pinned: false, windowId: 1, active: false },
    { id: 5, title: 'Amazon - Mechanical Keyboard', url: 'https://amazon.com/dp/B09XYZ', pinned: false, windowId: 1, active: false },
    { id: 6, title: 'YouTube - AI in 2026', url: 'https://youtube.com/watch?v=abc123', pinned: false, windowId: 1, active: false },
    { id: 7, title: 'TechCrunch - Latest News', url: 'https://techcrunch.com/2026/06/09', pinned: false, windowId: 1, active: false },
    { id: 8, title: 'Stack Overflow - React hooks', url: 'https://stackoverflow.com/questions/123', pinned: false, windowId: 1, active: false },
  ];
}
