export interface SnapshotTabItem {
  url: string;
  title: string;
  pinned: boolean;
  favIconUrl?: string;
}

export interface DuplicateGroup {
  url: string;
  tabs: chrome.tabs.Tab[];
}

export function groupTabsByWindow(tabs: chrome.tabs.Tab[]): Map<number, chrome.tabs.Tab[]> {
  const groups = new Map<number, chrome.tabs.Tab[]>();
  for (const tab of tabs) {
    const winId = tab.windowId ?? 0;
    if (!groups.has(winId)) groups.set(winId, []);
    groups.get(winId)!.push(tab);
  }
  return groups;
}

export function findDuplicateTabs(tabs: chrome.tabs.Tab[]): DuplicateGroup[] {
  const urlMap = new Map<string, chrome.tabs.Tab[]>();
  for (const tab of tabs) {
    if (!tab.url) continue;
    if (!urlMap.has(tab.url)) urlMap.set(tab.url, []);
    urlMap.get(tab.url)!.push(tab);
  }
  const duplicates: DuplicateGroup[] = [];
  for (const [url, group] of urlMap) {
    if (group.length > 1) duplicates.push({ url, tabs: group });
  }
  return duplicates;
}

export function getPinnedTabs(tabs: chrome.tabs.Tab[]): chrome.tabs.Tab[] {
  return tabs.filter(t => t.pinned);
}

export function filterTabsByCategory(
  tabs: chrome.tabs.Tab[],
  category: string,
  classifications: Map<number, string>,
): chrome.tabs.Tab[] {
  if (category === 'all') return tabs;
  return tabs.filter(tab => {
    const cat = classifications.get(tab.id ?? -1);
    return cat === category;
  });
}

export function isTabStale(lastAccessed: number, staleMs = 24 * 60 * 60 * 1000): boolean {
  return Date.now() - lastAccessed > staleMs;
}

export function tabToSnapshotItem(tab: chrome.tabs.Tab): SnapshotTabItem {
  return {
    url: tab.url ?? '',
    title: tab.title ?? '',
    pinned: tab.pinned ?? false,
    favIconUrl: tab.favIconUrl,
  };
}
