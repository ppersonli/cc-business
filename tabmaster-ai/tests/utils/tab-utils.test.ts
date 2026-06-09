import { describe, it, expect } from 'vitest';
import {
  groupTabsByWindow,
  groupTabsByCategory,
  findDuplicateTabs,
  findInactiveTabs,
  getCloseableTabs,
  createSnapshot,
  normalizeUrl,
  searchTabs,
  filterTabs,
  sortTabs,
  type TabInfo,
  type ClassifiedTab,
} from '../../utils/tab-utils';

const mockTabs: TabInfo[] = [
  { id: 1, title: 'React Docs', url: 'https://react.dev', pinned: true, windowId: 1, active: true },
  { id: 2, title: 'GitHub', url: 'https://github.com', pinned: false, windowId: 1, active: false },
  { id: 3, title: 'Twitter', url: 'https://twitter.com', pinned: false, windowId: 1, active: false },
  { id: 4, title: 'React Docs (dup)', url: 'https://react.dev/', pinned: false, windowId: 1, active: false },
  { id: 5, title: 'Amazon', url: 'https://amazon.com/dp/123', pinned: false, windowId: 2, active: false },
];

describe('groupTabsByWindow', () => {
  it('groups tabs by window ID', () => {
    const groups = groupTabsByWindow(mockTabs);
    expect(groups.size).toBe(2);
    expect(groups.get(1)).toHaveLength(4);
    expect(groups.get(2)).toHaveLength(1);
  });

  it('returns empty map for empty input', () => {
    const groups = groupTabsByWindow([]);
    expect(groups.size).toBe(0);
  });
});

describe('groupTabsByCategory', () => {
  it('groups classified tabs by category', () => {
    const classified: ClassifiedTab[] = [
      { ...mockTabs[0], category: 'work', confidence: 0.9 },
      { ...mockTabs[1], category: 'work', confidence: 0.8 },
      { ...mockTabs[2], category: 'social', confidence: 0.95 },
    ];
    const groups = groupTabsByCategory(classified);
    expect(groups.get('work')).toHaveLength(2);
    expect(groups.get('social')).toHaveLength(1);
    expect(groups.get('shopping')).toHaveLength(0);
  });
});

describe('findDuplicateTabs', () => {
  it('finds tabs with same normalized URL', () => {
    const dupes = findDuplicateTabs(mockTabs);
    expect(dupes.length).toBeGreaterThanOrEqual(1);
    // react.dev and react.dev/ should be duplicates
    const reactGroup = dupes.find(g => g.some(t => t.url.includes('react.dev')));
    expect(reactGroup).toBeDefined();
    expect(reactGroup!.length).toBe(2);
  });

  it('ignores chrome:// and about: pages', () => {
    const tabs: TabInfo[] = [
      { id: 1, title: 'Chrome', url: 'chrome://settings', pinned: false, windowId: 1, active: false },
      { id: 2, title: 'Chrome', url: 'chrome://settings', pinned: false, windowId: 1, active: false },
    ];
    const dupes = findDuplicateTabs(tabs);
    expect(dupes).toHaveLength(0);
  });
});

describe('findInactiveTabs', () => {
  it('finds tabs inactive for more than threshold', () => {
    const times = new Map<number, number>();
    times.set(1, Date.now()); // Active now
    times.set(2, Date.now() - 86400000 * 2); // 2 days ago
    times.set(3, Date.now() - 3600000); // 1 hour ago

    const inactive = findInactiveTabs(mockTabs.slice(0, 3), times, 86400000);
    expect(inactive).toHaveLength(1);
    expect(inactive[0].id).toBe(2);
  });

  it('excludes pinned tabs', () => {
    const times = new Map<number, number>();
    times.set(1, Date.now() - 86400000 * 2); // Pinned, inactive

    const inactive = findInactiveTabs([mockTabs[0]], times, 86400000);
    expect(inactive).toHaveLength(0);
  });
});

describe('getCloseableTabs', () => {
  it('returns non-pinned, non-active tabs', () => {
    const closeable = getCloseableTabs(mockTabs);
    expect(closeable.every(t => !t.pinned && !t.active)).toBe(true);
    expect(closeable).toHaveLength(4);
  });
});

describe('createSnapshot', () => {
  it('creates a snapshot with correct structure', () => {
    const snapshot = createSnapshot('Test', mockTabs, 1);
    expect(snapshot.name).toBe('Test');
    expect(snapshot.tabs).toHaveLength(5);
    expect(snapshot.windowId).toBe(1);
    expect(snapshot.id).toBeTruthy();
    expect(snapshot.createdAt).toBeGreaterThan(0);
  });
});

describe('normalizeUrl', () => {
  it('normalizes URLs correctly', () => {
    expect(normalizeUrl('https://react.dev/')).toBe('https://react.dev');
    expect(normalizeUrl('https://react.dev')).toBe('https://react.dev');
    expect(normalizeUrl('https://example.com/path?q=1#hash')).toBe('https://example.com/path');
  });

  it('returns empty for chrome/edge/about URLs', () => {
    expect(normalizeUrl('chrome://settings')).toBe('');
    expect(normalizeUrl('edge://flags')).toBe('');
    expect(normalizeUrl('about:blank')).toBe('');
  });

  it('returns empty for invalid URLs', () => {
    expect(normalizeUrl('not-a-url')).toBe('');
  });
});

describe('searchTabs', () => {
  it('finds tabs by title', () => {
    const results = searchTabs(mockTabs, 'React');
    expect(results).toHaveLength(2);
  });

  it('finds tabs by URL', () => {
    const results = searchTabs(mockTabs, 'github');
    expect(results).toHaveLength(1);
  });

  it('is case-insensitive', () => {
    const results = searchTabs(mockTabs, 'REACT');
    expect(results).toHaveLength(2);
  });

  it('returns empty for no matches', () => {
    const results = searchTabs(mockTabs, 'nonexistent');
    expect(results).toHaveLength(0);
  });
});

describe('filterTabs', () => {
  it('returns all tabs for empty query', () => {
    expect(filterTabs(mockTabs, '')).toHaveLength(5);
    expect(filterTabs(mockTabs, '   ')).toHaveLength(5);
  });

  it('filters by query', () => {
    expect(filterTabs(mockTabs, 'Twitter')).toHaveLength(1);
  });
});

describe('sortTabs', () => {
  it('puts pinned tabs first', () => {
    const sorted = sortTabs(mockTabs);
    expect(sorted[0].pinned).toBe(true);
    expect(sorted[0].id).toBe(1);
  });

  it('sorts non-pinned by title', () => {
    const sorted = sortTabs(mockTabs);
    const nonPinned = sorted.filter(t => !t.pinned);
    for (let i = 1; i < nonPinned.length; i++) {
      expect(nonPinned[i].title.localeCompare(nonPinned[i - 1].title)).toBeGreaterThanOrEqual(0);
    }
  });
});
