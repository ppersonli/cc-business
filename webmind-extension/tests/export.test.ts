import { describe, it, expect } from 'vitest';
import { exportAsJSON, exportAsHTML, exportForPage } from '../utils/export';
import { createHighlight } from '../utils/highlight-utils';
import type { Highlight } from '../utils/highlight-utils';

const sampleHighlights: Highlight[] = [
  createHighlight({ id: 'h1', url: 'https://a.com', title: 'Article A', text: 'First highlight text', startOffset: 0, endOffset: 19, xpath: '/p[1]', color: 'yellow' }),
  createHighlight({ id: 'h2', url: 'https://a.com', title: 'Article A', text: 'Second highlight text', startOffset: 50, endOffset: 70, xpath: '/p[2]', color: 'green' }),
  createHighlight({ id: 'h3', url: 'https://b.com', title: 'Article B', text: 'Third highlight', startOffset: 0, endOffset: 14, xpath: '/div/p', color: 'blue', note: 'Important!' }),
];

describe('exportAsJSON', () => {
  it('returns valid JSON string', () => {
    const json = exportAsJSON(sampleHighlights);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('contains all highlights', () => {
    const json = exportAsJSON(sampleHighlights);
    const parsed = JSON.parse(json);
    expect(parsed).toHaveLength(3);
  });

  it('preserves highlight data', () => {
    const json = exportAsJSON(sampleHighlights);
    const parsed = JSON.parse(json);
    expect(parsed[0].text).toBe('First highlight text');
    expect(parsed[0].url).toBe('https://a.com');
    expect(parsed[2].note).toBe('Important!');
  });

  it('handles empty array', () => {
    const json = exportAsJSON([]);
    expect(JSON.parse(json)).toEqual([]);
  });

  it('includes metadata', () => {
    const json = exportAsJSON(sampleHighlights);
    const parsed = JSON.parse(json);
    expect(parsed[0].createdAt).toBeDefined();
    expect(parsed[0].color).toBeDefined();
  });
});

describe('exportAsHTML', () => {
  it('returns valid HTML', () => {
    const html = exportAsHTML(sampleHighlights);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('</html>');
  });

  it('contains highlight text', () => {
    const html = exportAsHTML(sampleHighlights);
    expect(html).toContain('First highlight text');
    expect(html).toContain('Second highlight text');
    expect(html).toContain('Third highlight');
  });

  it('groups by page', () => {
    const html = exportAsHTML(sampleHighlights);
    expect(html).toContain('Article A');
    expect(html).toContain('Article B');
  });

  it('includes notes when present', () => {
    const html = exportAsHTML(sampleHighlights);
    expect(html).toContain('Important!');
  });

  it('includes color styling', () => {
    const html = exportAsHTML(sampleHighlights);
    expect(html).toContain('background');
  });

  it('handles empty array', () => {
    const html = exportAsHTML([]);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('No highlights');
  });

  it('includes page URLs', () => {
    const html = exportAsHTML(sampleHighlights);
    expect(html).toContain('https://a.com');
    expect(html).toContain('https://b.com');
  });
});

describe('exportForPage', () => {
  it('exports only highlights for the specified page', () => {
    const html = exportForPage(sampleHighlights, 'https://a.com');
    expect(html).toContain('First highlight text');
    expect(html).toContain('Second highlight text');
    expect(html).not.toContain('Third highlight');
  });

  it('returns empty message for no matches', () => {
    const html = exportForPage(sampleHighlights, 'https://none.com');
    expect(html).toContain('No highlights');
  });

  it('preserves page title', () => {
    const html = exportForPage(sampleHighlights, 'https://a.com');
    expect(html).toContain('Article A');
  });
});
