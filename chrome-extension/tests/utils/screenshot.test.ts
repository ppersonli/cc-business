import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  saveToHistory,
  getHistory,
  clearHistory,
  downloadScreenshot,
} from '~/utils/screenshot';
import type { ScreenshotHistoryEntry } from '~/utils/screenshot';

describe('utils/screenshot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).browser.storage.local.data = {};
  });

  describe('saveToHistory', () => {
    const entry: ScreenshotHistoryEntry = {
      id: 'test-1',
      thumbnail: 'data:image/png;base64,abc',
      analysisMode: 'describe',
      result: 'A blue button',
      url: 'https://example.com',
      title: 'Example Page',
      timestamp: Date.now(),
    };

    it('saves entry to storage', async () => {
      await saveToHistory(entry);

      const { screenshotHistory } = await browser.storage.local.get('screenshotHistory');
      expect(screenshotHistory).toHaveLength(1);
      expect(screenshotHistory[0]).toEqual(entry);
    });

    it('prepends new entries (newest first)', async () => {
      const entry1 = { ...entry, id: 'first', timestamp: 1000 };
      const entry2 = { ...entry, id: 'second', timestamp: 2000 };

      await saveToHistory(entry1);
      await saveToHistory(entry2);

      const { screenshotHistory } = await browser.storage.local.get('screenshotHistory');
      expect(screenshotHistory).toHaveLength(2);
      expect(screenshotHistory[0].id).toBe('second');
      expect(screenshotHistory[1].id).toBe('first');
    });

    it('limits history to 100 entries', async () => {
      // Pre-populate with 100 entries
      const existing = Array.from({ length: 100 }, (_, i) => ({
        ...entry,
        id: `existing-${i}`,
        timestamp: i,
      }));
      await browser.storage.local.set({ screenshotHistory: existing });

      await saveToHistory({ ...entry, id: 'new-entry', timestamp: 999 });

      const { screenshotHistory } = await browser.storage.local.get('screenshotHistory');
      expect(screenshotHistory).toHaveLength(100);
      expect(screenshotHistory[0].id).toBe('new-entry');
      expect(screenshotHistory.find((e: any) => e.id === 'existing-99')).toBeUndefined();
    });
  });

  describe('getHistory', () => {
    it('returns empty array when no history exists', async () => {
      const result = await getHistory();
      expect(result).toEqual([]);
    });

    it('returns saved history', async () => {
      const entries: ScreenshotHistoryEntry[] = [
        {
          id: '1',
          thumbnail: 'data:image/png;base64,a',
          analysisMode: 'describe',
          result: 'Result 1',
          url: 'https://a.com',
          title: 'Page A',
          timestamp: 1000,
        },
        {
          id: '2',
          thumbnail: 'data:image/png;base64,b',
          analysisMode: 'code',
          result: 'Result 2',
          url: 'https://b.com',
          title: 'Page B',
          timestamp: 2000,
        },
      ];
      await browser.storage.local.set({ screenshotHistory: entries });

      const result = await getHistory();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
    });
  });

  describe('clearHistory', () => {
    it('clears all history', async () => {
      await browser.storage.local.set({
        screenshotHistory: [
          { id: '1', thumbnail: '', analysisMode: 'describe', result: '', url: '', title: '', timestamp: 0 },
        ],
      });

      await clearHistory();

      const { screenshotHistory } = await browser.storage.local.get('screenshotHistory');
      expect(screenshotHistory).toEqual([]);
    });

    it('works when no history exists', async () => {
      await clearHistory();

      const { screenshotHistory } = await browser.storage.local.get('screenshotHistory');
      expect(screenshotHistory).toEqual([]);
    });
  });

  describe('downloadScreenshot', () => {
    it('creates a download link and clicks it', () => {
      const mockClick = vi.fn();
      const mockRemove = vi.fn();
      const mockAppend = vi.fn();

      const mockLink = {
        href: '',
        download: '',
        click: mockClick,
      };

      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'a') return mockLink as any;
        return {} as any;
      });
      vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppend as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemove as any);

      downloadScreenshot('data:image/png;base64,abc', 'screenshot.png');

      expect(mockLink.href).toBe('data:image/png;base64,abc');
      expect(mockLink.download).toBe('screenshot.png');
      expect(mockAppend).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemove).toHaveBeenCalled();
    });
  });
});
