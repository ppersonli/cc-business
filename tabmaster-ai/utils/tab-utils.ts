/**
 * Tab manipulation helper functions.
 * Pure functions — no side effects, easy to test.
 */

export interface TabInfo {
  id: number;
  title: string;
  url: string;
  favIconUrl?: string;
  pinned: boolean;
  windowId: number;
  active: boolean;
  groupId?: number;
}

export type TabCategory = 'work' | 'research' | 'social' | 'shopping' | 'entertainment' | 'news' | 'other';

export interface ClassifiedTab extends TabInfo {
  category: TabCategory;
  confidence: number;
}

export interface Snapshot {
  id: string;
  name: string;
  createdAt: number;
  tabs: {
    url: string;
    title: string;
    pinned: boolean;
    favIconUrl?: string;
  }[];
  windowId: number;
}

/**
 * Group tabs by window ID.
 */
export function groupTabsByWindow(tabs: TabInfo[]): Map<number, TabInfo[]> {
  const groups = new Map<number, TabInfo[]>();
  for (const tab of tabs) {
    const existing = groups.get(tab.windowId) || [];
    existing.push(tab);
    groups.set(tab.windowId, existing);
  }
  return groups;
}

/**
 * Group tabs by category.
 */
export function groupTabsByCategory(tabs: ClassifiedTab[]): Map<TabCategory, ClassifiedTab[]> {
  const groups = new Map<TabCategory, ClassifiedTab[]>();
  const order: TabCategory[] = ['work', 'research', 'social', 'shopping', 'entertainment', 'news', 'other'];
  
  for (const cat of order) {
    groups.set(cat, []);
  }
  
  for (const tab of tabs) {
    const existing = groups.get(tab.category) || [];
    existing.push(tab);
    groups.set(tab.category, existing);
  }
  
  return groups;
}

/**
 * Find duplicate tabs (same URL, ignoring hash and trailing slash).
 */
export function findDuplicateTabs(tabs: TabInfo[]): TabInfo[][] {
  const urlMap = new Map<string, TabInfo[]>();
  
  for (const tab of tabs) {
    const normalized = normalizeUrl(tab.url);
    if (!normalized) continue;
    const existing = urlMap.get(normalized) || [];
    existing.push(tab);
    urlMap.set(normalized, existing);
  }
  
  const duplicates: TabInfo[][] = [];
  for (const group of urlMap.values()) {
    if (group.length > 1) {
      duplicates.push(group);
    }
  }
  
  return duplicates;
}

/**
 * Find tabs inactive for more than the given duration (ms).
 */
export function findInactiveTabs(tabs: TabInfo[], activationTimes: Map<number, number>, maxInactiveMs: number): TabInfo[] {
  const now = Date.now();
  return tabs.filter(tab => {
    const lastActive = activationTimes.get(tab.id) || 0;
    return now - lastActive > maxInactiveMs && !tab.pinned;
  });
}

/**
 * Get tabs that can be closed (non-pinned, not active).
 */
export function getCloseableTabs(tabs: TabInfo[]): TabInfo[] {
  return tabs.filter(tab => !tab.pinned && !tab.active);
}

/**
 * Create a snapshot from tabs.
 */
export function createSnapshot(name: string, tabs: TabInfo[], windowId: number): Snapshot {
  return {
    id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    name,
    createdAt: Date.now(),
    tabs: tabs.map(t => ({
      url: t.url,
      title: t.title,
      pinned: t.pinned,
      favIconUrl: t.favIconUrl,
    })),
    windowId,
  };
}

/**
 * Normalize a URL for comparison (strip hash, trailing slash, query params for duplicate detection).
 */
export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    // Ignore chrome://, edge://, about: pages
    if (u.protocol === 'chrome:' || u.protocol === 'edge:' || u.protocol === 'about:') {
      return '';
    }
    return `${u.origin}${u.pathname}`.replace(/\/+$/, '');
  } catch {
    return '';
  }
}

/**
 * Simple text search across tabs (case-insensitive).
 */
export function searchTabs(tabs: TabInfo[], query: string): TabInfo[] {
  const q = query.toLowerCase();
  return tabs.filter(tab =>
    tab.title.toLowerCase().includes(q) ||
    tab.url.toLowerCase().includes(q)
  );
}

/**
 * Filter tabs by search query (for non-AI fallback).
 */
export function filterTabs(tabs: TabInfo[], query: string): TabInfo[] {
  if (!query.trim()) return tabs;
  return searchTabs(tabs, query);
}

/**
 * Sort tabs: pinned first, then by title.
 */
export function sortTabs(tabs: TabInfo[]): TabInfo[] {
  return [...tabs].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return a.title.localeCompare(b.title);
  });
}
