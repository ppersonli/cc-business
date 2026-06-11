import { describe, it, expect } from 'vitest';
import {
  searchHighlights,
  searchByTag,
  getRecentHighlights,
  getUniquePages,
  groupHighlightsByPage,
} from '../utils/search';
import { createHighlight } from '../utils/highlight-utils';
import type { Highlight } from '../utils/highlight-utils';

const sampleHighlights: Highlight[] = [
  createHighlight({ id: 'h1', url: 'https://a.com/article', title: 'AI Article', text: 'Machine learning is transforming healthcare', startOffset: 0, endOffset: 39, xpath: '/p[1]', color: 'yellow' }),
  createHighlight({ id: 'h2', url: 'https://a.com/article', title: 'AI Article', text: 'Deep neural networks achieve superhuman accuracy', startOffset: 100, endOffset: 148, xpath: '/p[3]', color: 'green' }),
  createHighlight({ id: 'h3', url: 'https://b.com/blog', title: 'Web Dev Tips', text: 'CSS Grid simplifies complex layouts', startOffset: 0, endOffset: 34, xpath: '/div/p', color: 'blue' }),
  createHighlight({ id: 'h4', url: 'https://c.com/research', title: 'Quantum Computing', text: 'Quantum entanglement enables secure communication', startOffset: 0, endOffset: 50, xpath: '/article/p', color: 'pink' }),
];

describe('searchHighlights', () => {
  it('finds highlights by text content', () => {
    const results = searchHighlights(sampleHighlights, 'machine learning');
    expect(results).toHaveLength(1);
    expect(results[0].text).toContain('Machine learning');
  });

  it('finds highlights by title', () => {
    const results = searchHighlights(sampleHighlights, 'quantum');
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Quantum Computing');
  });

  it('is case insensitive', () => {
    const results = searchHighlights(sampleHighlights, 'DEEP NEURAL');
    expect(results).toHaveLength(1);
  });

  it('returns empty array for no matches', () => {
    const results = searchHighlights(sampleHighlights, 'blockchain');
    expect(results).toHaveLength(0);
  });

  it('returns all highlights for empty query', () => {
    const results = searchHighlights(sampleHighlights, '');
    expect(results).toHaveLength(4);
  });

  it('searches across multiple fields', () => {
    const results = searchHighlights(sampleHighlights, 'article');
    expect(results.length).toBeGreaterThanOrEqual(2);
  });
});

describe('getRecentHighlights', () => {
  it('returns highlights sorted by createdAt descending', () => {
    const recent = getRecentHighlights(sampleHighlights, 2);
    expect(recent).toHaveLength(2);
    expect(recent[0].createdAt).toBeGreaterThanOrEqual(recent[1].createdAt);
  });

  it('respects the limit parameter', () => {
    const recent = getRecentHighlights(sampleHighlights, 1);
    expect(recent).toHaveLength(1);
  });

  it('returns all when limit exceeds count', () => {
    const recent = getRecentHighlights(sampleHighlights, 100);
    expect(recent).toHaveLength(4);
  });

  it('returns empty for empty input', () => {
    const recent = getRecentHighlights([], 5);
    expect(recent).toHaveLength(0);
  });
});

describe('getUniquePages', () => {
  it('returns unique page URLs', () => {
    const pages = getUniquePages(sampleHighlights);
    expect(pages).toHaveLength(3);
    expect(pages).toContain('https://a.com/article');
    expect(pages).toContain('https://b.com/blog');
    expect(pages).toContain('https://c.com/research');
  });

  it('returns empty for empty input', () => {
    expect(getUniquePages([])).toHaveLength(0);
  });
});

describe('groupHighlightsByPage', () => {
  it('groups highlights by URL', () => {
    const groups = groupHighlightsByPage(sampleHighlights);
    expect(Object.keys(groups)).toHaveLength(3);
    expect(groups['https://a.com/article']).toHaveLength(2);
    expect(groups['https://b.com/blog']).toHaveLength(1);
    expect(groups['https://c.com/research']).toHaveLength(1);
  });

  it('preserves title in each group', () => {
    const groups = groupHighlightsByPage(sampleHighlights);
    expect(groups['https://a.com/article'][0].title).toBe('AI Article');
    expect(groups['https://b.com/blog'][0].title).toBe('Web Dev Tips');
  });
});
