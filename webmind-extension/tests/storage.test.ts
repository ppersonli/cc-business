import { describe, it, expect } from 'vitest';
import {
  getAllHighlights,
  saveHighlights,
  addHighlightToStorage,
  removeHighlightFromStorage,
  getHighlightStats,
} from '../utils/storage';
import { createHighlight } from '../utils/highlight-utils';

describe('getAllHighlights', () => {
  it('returns empty array when no highlights stored', async () => {
    const result = await getAllHighlights();
    expect(result).toEqual([]);
  });

  it('returns stored highlights', async () => {
    const h = createHighlight({ url: 'https://a.com', title: 'A', text: 'test', startOffset: 0, endOffset: 4, xpath: '/p' });
    await chrome.storage.local.set({ webmind_highlights: [h] });

    const result = await getAllHighlights();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(h.id);
  });
});

describe('saveHighlights', () => {
  it('saves highlights to storage', async () => {
    const h = createHighlight({ url: 'https://a.com', title: 'A', text: 'test', startOffset: 0, endOffset: 4, xpath: '/p' });
    await saveHighlights([h]);

    expect(chrome.storage.local.set).toHaveBeenCalledWith({ webmind_highlights: [h] });
  });

  it('overwrites existing highlights', async () => {
    const h1 = createHighlight({ url: 'https://a.com', title: 'A', text: 'first', startOffset: 0, endOffset: 5, xpath: '/p' });
    const h2 = createHighlight({ url: 'https://b.com', title: 'B', text: 'second', startOffset: 0, endOffset: 6, xpath: '/p' });

    await saveHighlights([h1]);
    await saveHighlights([h2]);

    const stored = await chrome.storage.local.get('webmind_highlights');
    expect(stored.webmind_highlights).toHaveLength(1);
    expect(stored.webmind_highlights[0].id).toBe(h2.id);
  });
});

describe('addHighlightToStorage', () => {
  it('adds a highlight to empty storage', async () => {
    const h = createHighlight({ url: 'https://a.com', title: 'A', text: 'test', startOffset: 0, endOffset: 4, xpath: '/p' });
    await addHighlightToStorage(h);

    const stored = await chrome.storage.local.get('webmind_highlights');
    expect(stored.webmind_highlights).toHaveLength(1);
  });

  it('appends to existing highlights', async () => {
    const h1 = createHighlight({ url: 'https://a.com', title: 'A', text: 'first', startOffset: 0, endOffset: 5, xpath: '/p' });
    const h2 = createHighlight({ url: 'https://a.com', title: 'A', text: 'second', startOffset: 10, endOffset: 16, xpath: '/p' });

    await addHighlightToStorage(h1);
    await addHighlightToStorage(h2);

    const stored = await chrome.storage.local.get('webmind_highlights');
    expect(stored.webmind_highlights).toHaveLength(2);
  });
});

describe('removeHighlightFromStorage', () => {
  it('removes a highlight by id', async () => {
    const h1 = createHighlight({ url: 'https://a.com', title: 'A', text: 'first', startOffset: 0, endOffset: 5, xpath: '/p' });
    const h2 = createHighlight({ url: 'https://a.com', title: 'A', text: 'second', startOffset: 10, endOffset: 16, xpath: '/p' });
    await saveHighlights([h1, h2]);

    await removeHighlightFromStorage(h1.id);

    const stored = await chrome.storage.local.get('webmind_highlights');
    expect(stored.webmind_highlights).toHaveLength(1);
    expect(stored.webmind_highlights[0].id).toBe(h2.id);
  });

  it('does nothing when id not found', async () => {
    const h = createHighlight({ url: 'https://a.com', title: 'A', text: 'test', startOffset: 0, endOffset: 4, xpath: '/p' });
    await saveHighlights([h]);

    await removeHighlightFromStorage('nonexistent');

    const stored = await chrome.storage.local.get('webmind_highlights');
    expect(stored.webmind_highlights).toHaveLength(1);
  });
});

describe('getHighlightStats', () => {
  it('returns correct stats for multiple pages', async () => {
    const highlights = [
      createHighlight({ url: 'https://a.com', title: 'A', text: 't1', startOffset: 0, endOffset: 2, xpath: '/p', color: 'yellow' }),
      createHighlight({ url: 'https://a.com', title: 'A', text: 't2', startOffset: 5, endOffset: 7, xpath: '/p', color: 'green' }),
      createHighlight({ url: 'https://b.com', title: 'B', text: 't3', startOffset: 0, endOffset: 2, xpath: '/p', color: 'pink' }),
    ];
    await saveHighlights(highlights);

    const stats = await getHighlightStats();
    expect(stats.total).toBe(3);
    expect(stats.pages).toBe(2);
  });

  it('returns zeros for empty storage', async () => {
    const stats = await getHighlightStats();
    expect(stats.total).toBe(0);
    expect(stats.pages).toBe(0);
  });
});
