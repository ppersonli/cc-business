/**
 * Chrome storage wrapper for WebMind highlights.
 */

import type { Highlight } from './highlight-utils';

const STORAGE_KEY = 'webmind_highlights';

export async function getAllHighlights(): Promise<Highlight[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return (result[STORAGE_KEY] as Highlight[]) || [];
}

export async function saveHighlights(highlights: Highlight[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: highlights });
}

export async function addHighlightToStorage(highlight: Highlight): Promise<void> {
  const existing = await getAllHighlights();
  existing.push(highlight);
  await saveHighlights(existing);
}

export async function removeHighlightFromStorage(id: string): Promise<void> {
  const existing = await getAllHighlights();
  const filtered = existing.filter((h) => h.id !== id);
  await saveHighlights(filtered);
}

export async function getHighlightStats(): Promise<{ total: number; pages: number }> {
  const highlights = await getAllHighlights();
  const uniquePages = new Set(highlights.map((h) => h.url));
  return { total: highlights.length, pages: uniquePages.size };
}
