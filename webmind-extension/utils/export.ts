/**
 * Export utilities for WebMind highlights.
 */

import type { Highlight } from './highlight-utils';
import { groupHighlightsByPage } from './search';
import { formatDate } from './dom-utils';

export function exportAsJSON(highlights: Highlight[]): string {
  return JSON.stringify(highlights, null, 2);
}

export function exportAsHTML(highlights: Highlight[]): string {
  if (highlights.length === 0) {
    return `<!DOCTYPE html>
<html><head><title>WebMind Highlights</title></head>
<body><h1>WebMind Highlights</h1><p>No highlights to export.</p></body></html>`;
  }

  const groups = groupHighlightsByPage(highlights);
  let body = '';

  for (const [url, pageHighlights] of Object.entries(groups)) {
    const title = pageHighlights[0].title;
    body += `<div class="page">
  <h2><a href="${escapeHtml(url)}">${escapeHtml(title)}</a></h2>
  <p class="url">${escapeHtml(url)}</p>\n`;

    for (const h of pageHighlights) {
      const color = getColorHex(h.color);
      body += `  <div class="highlight" style="background: ${color}; padding: 8px 12px; margin: 8px 0; border-left: 4px solid ${color}; border-radius: 4px;">
    <p class="text">"${escapeHtml(h.text)}"</p>
    ${h.note ? `<p class="note" style="color: #666; font-style: italic; margin-top: 4px;">${escapeHtml(h.note)}</p>` : ''}
    <p class="meta" style="color: #999; font-size: 12px; margin-top: 4px;">${formatDate(h.createdAt)}</p>
  </div>\n`;
    }
    body += `</div>\n`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>WebMind Highlights</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; }
    h1 { color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 8px; }
    .page { margin-bottom: 32px; }
    .page h2 a { color: #1a1a1a; text-decoration: none; }
    .page h2 a:hover { text-decoration: underline; }
    .url { color: #666; font-size: 13px; margin-top: 4px; }
  </style>
</head>
<body>
<h1>WebMind Highlights</h1>
${body}
</body>
</html>`;
}

export function exportForPage(highlights: Highlight[], url: string): string {
  const pageHighlights = highlights.filter((h) => h.url === url);
  if (pageHighlights.length === 0) {
    return exportAsHTML([]);
  }
  return exportAsHTML(pageHighlights);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getColorHex(colorName: string): string {
  const colors: Record<string, string> = {
    yellow: '#fef08a',
    green: '#86efac',
    blue: '#93c5fd',
    pink: '#f9a8d4',
    purple: '#c4b5fd',
    orange: '#fdba74',
  };
  return colors[colorName] || colors.yellow;
}
