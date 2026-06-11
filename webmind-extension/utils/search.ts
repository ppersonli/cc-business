/**
 * Search and filtering utilities for WebMind highlights.
 */

import type { Highlight } from './highlight-utils';

export function searchHighlights(highlights: Highlight[], query: string): Highlight[] {
  if (!query.trim()) return highlights;

  const q = query.toLowerCase();
  return highlights.filter(
    (h) =>
      h.text.toLowerCase().includes(q) ||
      h.title.toLowerCase().includes(q) ||
      (h.note && h.note.toLowerCase().includes(q)) ||
      h.url.toLowerCase().includes(q)
  );
}

export function searchByTag(highlights: Highlight[], tag: string): Highlight[] {
  return highlights.filter((h) => h.color === tag);
}

export function getRecentHighlights(highlights: Highlight[], limit: number): Highlight[] {
  return [...highlights].sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
}

export function getUniquePages(highlights: Highlight[]): string[] {
  return [...new Set(highlights.map((h) => h.url))];
}

export function groupHighlightsByPage(highlights: Highlight[]): Record<string, Highlight[]> {
  const groups: Record<string, Highlight[]> = {};
  for (const h of highlights) {
    if (!groups[h.url]) groups[h.url] = [];
    groups[h.url].push(h);
  }
  return groups;
}
