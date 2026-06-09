import { describe, it, expect } from 'vitest';
import {
  groupTabsByWindow,
  findDuplicateTabs,
  getPinnedTabs,
  filterTabsByCategory,
  isTabStale,
  tabToSnapshotItem,
} from '~/utils/tab-utils';

const mockTab = (id: number, overrides: Partial<any> = {}) => ({
  id,
  title: `Tab ${id}`,
  url: `https://example.com/${id}`,
  windowId: 1,
  pinned: false,
  active: false,
  favIconUrl: '',
  ...overrides,
});

describe('utils/tab-utils', () => {
  describe('groupTabsByWindow', () => {
    it('groups tabs by windowId', () => {
      const tabs = [mockTab(1, { windowId: 1 }), mockTab(2, { windowId: 1 }), mockTab(3, { windowId: 2 })];
      const groups = groupTabsByWindow(tabs as any);
      expect(groups.size).toBe(2);
      expect(groups.get(1)).toHaveLength(2);
      expect(groups.get(2)).toHaveLength(1);
    });

    it('returns empty map for empty input', () => {
      const groups = groupTabsByWindow([]);
      expect(groups.size).toBe(0);
    });
  });

  describe('findDuplicateTabs', () => {
    it('finds tabs with duplicate URLs', () => {
      const tabs = [
        mockTab(1, { url: 'https://example.com' }),
        mockTab(2, { url: 'https://other.com' }),
        mockTab(3, { url: 'https://example.com' }),
        mockTab(4, { url: 'https://example.com' }),
      ];
      const dupes = findDuplicateTabs(tabs as any);
      expect(dupes).toHaveLength(1);
      expect(dupes[0].url).toBe('https://example.com');
      expect(dupes[0].tabs).toHaveLength(3);
    });

    it('returns empty array when no duplicates', () => {
      const tabs = [mockTab(1), mockTab(2), mockTab(3)];
      const dupes = findDuplicateTabs(tabs as any);
      expect(dupes).toHaveLength(0);
    });
  });

  describe('getPinnedTabs', () => {
    it('filters pinned tabs', () => {
      const tabs = [mockTab(1, { pinned: true }), mockTab(2, { pinned: false }), mockTab(3, { pinned: true })];
      const pinned = getPinnedTabs(tabs as any);
      expect(pinned).toHaveLength(2);
      expect(pinned.every((t: any) => t.pinned)).toBe(true);
    });
  });

  describe('filterTabsByCategory', () => {
    it('filters tabs by category string', () => {
      const tabs = [mockTab(1), mockTab(2), mockTab(3)];
      const classifications = new Map([[1, 'work'], [2, 'social'], [3, 'work']]);
      const filtered = filterTabsByCategory(tabs as any, 'work', classifications);
      expect(filtered).toHaveLength(2);
    });

    it('returns all tabs for "all" category', () => {
      const tabs = [mockTab(1), mockTab(2)];
      const filtered = filterTabsByCategory(tabs as any, 'all', new Map());
      expect(filtered).toHaveLength(2);
    });
  });

  describe('isTabStale', () => {
    it('returns true for tabs older than 24h', () => {
      expect(isTabStale(Date.now() - 25 * 60 * 60 * 1000)).toBe(true);
    });

    it('returns false for recent tabs', () => {
      expect(isTabStale(Date.now() - 1000)).toBe(false);
    });
  });

  describe('tabToSnapshotItem', () => {
    it('converts a chrome tab to a snapshot item', () => {
      const tab = mockTab(1, { title: 'My Page', url: 'https://example.com', pinned: true, favIconUrl: 'https://example.com/favicon.ico' });
      const item = tabToSnapshotItem(tab as any);
      expect(item).toEqual({
        url: 'https://example.com',
        title: 'My Page',
        pinned: true,
        favIconUrl: 'https://example.com/favicon.ico',
      });
    });
  });
});
