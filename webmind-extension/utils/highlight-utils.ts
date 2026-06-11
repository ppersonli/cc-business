/**
 * Core highlight data types and pure utility functions for WebMind.
 */

export interface HighlightColor {
  name: string;
  hex: string;
  rgba: string;
}

export interface Highlight {
  id: string;
  url: string;
  title: string;
  text: string;
  startOffset: number;
  endOffset: number;
  xpath: string;
  color: string;
  note: string | null;
  createdAt: number;
}

export const HIGHLIGHT_COLORS: HighlightColor[] = [
  { name: 'yellow', hex: '#fef08a', rgba: 'rgba(254, 240, 138, 0.4)' },
  { name: 'green', hex: '#86efac', rgba: 'rgba(134, 239, 172, 0.4)' },
  { name: 'blue', hex: '#93c5fd', rgba: 'rgba(147, 197, 253, 0.4)' },
  { name: 'pink', hex: '#f9a8d4', rgba: 'rgba(249, 168, 212, 0.4)' },
  { name: 'purple', hex: '#c4b5fd', rgba: 'rgba(196, 181, 253, 0.4)' },
  { name: 'orange', hex: '#fdba74', rgba: 'rgba(253, 186, 116, 0.4)' },
];

export function generateHighlightId(): string {
  return 'hl_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function getHighlightColor(name: string): HighlightColor {
  return HIGHLIGHT_COLORS.find((c) => c.name === name) || HIGHLIGHT_COLORS[0];
}

export function createHighlight(params: {
  id?: string;
  url: string;
  title: string;
  text: string;
  startOffset: number;
  endOffset: number;
  xpath: string;
  color?: string;
  note?: string;
}): Highlight {
  return {
    id: params.id || generateHighlightId(),
    url: params.url,
    title: params.title,
    text: params.text,
    startOffset: params.startOffset,
    endOffset: params.endOffset,
    xpath: params.xpath,
    color: params.color || 'yellow',
    note: params.note || null,
    createdAt: Date.now(),
  };
}

export function serializeHighlight(h: Highlight): string {
  return JSON.stringify(h);
}

export function deserializeHighlight(json: string): Highlight {
  return JSON.parse(json);
}

export function getHighlightsForPage(highlights: Highlight[], url: string): Highlight[] {
  return highlights
    .filter((h) => h.url === url)
    .sort((a, b) => a.startOffset - b.startOffset);
}

export function removeHighlight(highlights: Highlight[], id: string): Highlight[] {
  return highlights.filter((h) => h.id !== id);
}

export function updateHighlightNote(highlights: Highlight[], id: string, note: string): Highlight[] {
  return highlights.map((h) => (h.id === id ? { ...h, note } : h));
}
