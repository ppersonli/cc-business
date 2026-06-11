import { describe, it, expect } from 'vitest';
import {
  createHighlight,
  serializeHighlight,
  deserializeHighlight,
  getHighlightsForPage,
  removeHighlight,
  updateHighlightNote,
  generateHighlightId,
  getHighlightColor,
  HIGHLIGHT_COLORS,
} from '../utils/highlight-utils';
import type { Highlight } from '../utils/highlight-utils';

describe('generateHighlightId', () => {
  it('returns a non-empty string', () => {
    const id = generateHighlightId();
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('returns unique ids', () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateHighlightId()));
    expect(ids.size).toBe(50);
  });

  it('starts with hl_ prefix', () => {
    const id = generateHighlightId();
    expect(id).toMatch(/^hl_/);
  });
});

describe('HIGHLIGHT_COLORS', () => {
  it('has at least 5 colors', () => {
    expect(HIGHLIGHT_COLORS.length).toBeGreaterThanOrEqual(5);
  });

  it('each color has name, hex, and rgba', () => {
    for (const color of HIGHLIGHT_COLORS) {
      expect(color.name).toBeDefined();
      expect(color.hex).toMatch(/^#/);
      expect(color.rgba).toMatch(/^rgba\(/);
    }
  });
});

describe('getHighlightColor', () => {
  it('returns a valid color object', () => {
    const color = getHighlightColor('yellow');
    expect(color.name).toBe('yellow');
    expect(color.hex).toBeDefined();
  });

  it('falls back to yellow for unknown color', () => {
    const color = getHighlightColor('nonexistent');
    expect(color.name).toBe('yellow');
  });
});

describe('createHighlight', () => {
  it('creates a highlight with all required fields', () => {
    const h = createHighlight({
      url: 'https://example.com/article',
      title: 'Test Article',
      text: 'Important passage',
      startOffset: 10,
      endOffset: 30,
      xpath: '/html/body/p[1]',
      color: 'yellow',
    });

    expect(h.id).toMatch(/^hl_/);
    expect(h.url).toBe('https://example.com/article');
    expect(h.title).toBe('Test Article');
    expect(h.text).toBe('Important passage');
    expect(h.startOffset).toBe(10);
    expect(h.endOffset).toBe(30);
    expect(h.xpath).toBe('/html/body/p[1]');
    expect(h.color).toBe('yellow');
    expect(h.note).toBeNull();
    expect(h.createdAt).toBeGreaterThan(0);
  });

  it('uses provided id when given', () => {
    const h = createHighlight({
      id: 'custom-id',
      url: 'https://example.com',
      title: 'Page',
      text: 'text',
      startOffset: 0,
      endOffset: 4,
      xpath: '/p',
      color: 'green',
    });
    expect(h.id).toBe('custom-id');
  });

  it('defaults to yellow color when not specified', () => {
    const h = createHighlight({
      url: 'https://example.com',
      title: 'Page',
      text: 'text',
      startOffset: 0,
      endOffset: 4,
      xpath: '/p',
    });
    expect(h.color).toBe('yellow');
  });
});

describe('serializeHighlight / deserializeHighlight', () => {
  it('round-trips a highlight through JSON', () => {
    const h = createHighlight({
      url: 'https://example.com',
      title: 'Test',
      text: 'Hello world',
      startOffset: 0,
      endOffset: 11,
      xpath: '/html/body/p',
      color: 'blue',
    });

    const serialized = serializeHighlight(h);
    expect(typeof serialized).toBe('string');

    const deserialized = deserializeHighlight(serialized);
    expect(deserialized.id).toBe(h.id);
    expect(deserialized.text).toBe(h.text);
    expect(deserialized.createdAt).toBe(h.createdAt);
  });

  it('throws on invalid JSON', () => {
    expect(() => deserializeHighlight('not json')).toThrow();
  });
});

describe('getHighlightsForPage', () => {
  it('returns highlights matching the URL', () => {
    const highlights: Highlight[] = [
      createHighlight({ url: 'https://a.com', title: 'A', text: 't1', startOffset: 0, endOffset: 2, xpath: '/p', color: 'yellow' }),
      createHighlight({ url: 'https://b.com', title: 'B', text: 't2', startOffset: 0, endOffset: 2, xpath: '/p', color: 'green' }),
      createHighlight({ url: 'https://a.com', title: 'A', text: 't3', startOffset: 5, endOffset: 7, xpath: '/p', color: 'pink' }),
    ];

    const result = getHighlightsForPage(highlights, 'https://a.com');
    expect(result).toHaveLength(2);
    expect(result.every((h) => h.url === 'https://a.com')).toBe(true);
  });

  it('returns empty array when no matches', () => {
    const highlights: Highlight[] = [
      createHighlight({ url: 'https://a.com', title: 'A', text: 't', startOffset: 0, endOffset: 1, xpath: '/p' }),
    ];
    const result = getHighlightsForPage(highlights, 'https://other.com');
    expect(result).toHaveLength(0);
  });

  it('returns highlights sorted by startOffset', () => {
    const highlights: Highlight[] = [
      createHighlight({ url: 'https://a.com', title: 'A', text: 'second', startOffset: 20, endOffset: 26, xpath: '/p' }),
      createHighlight({ url: 'https://a.com', title: 'A', text: 'first', startOffset: 5, endOffset: 10, xpath: '/p' }),
    ];
    const result = getHighlightsForPage(highlights, 'https://a.com');
    expect(result[0].startOffset).toBeLessThan(result[1].startOffset);
  });
});

describe('removeHighlight', () => {
  it('removes a highlight by id', () => {
    const h1 = createHighlight({ url: 'https://a.com', title: 'A', text: 't1', startOffset: 0, endOffset: 2, xpath: '/p' });
    const h2 = createHighlight({ url: 'https://a.com', title: 'A', text: 't2', startOffset: 5, endOffset: 7, xpath: '/p' });
    const result = removeHighlight([h1, h2], h1.id);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(h2.id);
  });

  it('returns empty array when removing the only highlight', () => {
    const h = createHighlight({ url: 'https://a.com', title: 'A', text: 't', startOffset: 0, endOffset: 1, xpath: '/p' });
    const result = removeHighlight([h], h.id);
    expect(result).toHaveLength(0);
  });

  it('returns same array when id not found', () => {
    const h = createHighlight({ url: 'https://a.com', title: 'A', text: 't', startOffset: 0, endOffset: 1, xpath: '/p' });
    const result = removeHighlight([h], 'nonexistent');
    expect(result).toHaveLength(1);
  });
});

describe('updateHighlightNote', () => {
  it('adds a note to a highlight', () => {
    const h = createHighlight({ url: 'https://a.com', title: 'A', text: 't', startOffset: 0, endOffset: 1, xpath: '/p' });
    const result = updateHighlightNote([h], h.id, 'My note');
    expect(result[0].note).toBe('My note');
  });

  it('updates an existing note', () => {
    const h = createHighlight({ url: 'https://a.com', title: 'A', text: 't', startOffset: 0, endOffset: 1, xpath: '/p' });
    h.note = 'Old note';
    const result = updateHighlightNote([h], h.id, 'New note');
    expect(result[0].note).toBe('New note');
  });

  it('returns unchanged array when id not found', () => {
    const h = createHighlight({ url: 'https://a.com', title: 'A', text: 't', startOffset: 0, endOffset: 1, xpath: '/p' });
    const result = updateHighlightNote([h], 'nonexistent', 'note');
    expect(result[0].note).toBeNull();
  });
});
