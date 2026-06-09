/**
 * AI prompt templates for tab classification and search.
 */

import type { TabInfo, TabCategory } from './tab-utils';

export const CATEGORIES: TabCategory[] = [
  'work', 'research', 'social', 'shopping', 'entertainment', 'news', 'other',
];

export const CATEGORY_LABELS: Record<TabCategory, string> = {
  work: 'Work',
  research: 'Research',
  social: 'Social',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  news: 'News',
  other: 'Other',
};

export const CATEGORY_ICONS: Record<TabCategory, string> = {
  work: '💼',
  research: '🔬',
  social: '💬',
  shopping: '🛒',
  entertainment: '🎮',
  news: '📰',
  other: '📁',
};

/**
 * Build prompt for AI tab classification.
 */
export function buildClassificationPrompt(tabs: TabInfo[]): string {
  const tabList = tabs
    .map(t => `${t.id}: ${t.title} (${t.url})`)
    .join('\n');

  return `Classify these browser tabs into categories. Return a JSON array.

Categories: work, research, social, shopping, entertainment, news, other

Rules:
- "work": project management, docs, code repos, company tools, email
- "research": articles, documentation, Stack Overflow, Wikipedia, tutorials
- "social": social media, messaging, forums
- "shopping": e-commerce, product pages, price comparison
- "entertainment": videos, music, games, streaming
- "news": news sites, blogs, press
- "other": everything else

Tabs:
${tabList}

Return ONLY a JSON array (no markdown fences):
[{"id": tabId, "category": "category", "confidence": 0.95}]`;
}

/**
 * Build prompt for AI tab search.
 */
export function buildSearchPrompt(query: string, tabs: TabInfo[]): string {
  const tabList = tabs
    .map(t => `${t.id}: ${t.title} (${t.url})`)
    .join('\n');

  return `User is looking for a specific tab. Find the most relevant matches.

Query: "${query}"

Open tabs:
${tabList}

Return ONLY a JSON array (no markdown fences), sorted by relevance descending:
[{"id": tabId, "relevance": 0.95, "reason": "why this matches"}]`;
}

/**
 * Parse AI classification response.
 */
export function parseClassificationResponse(
  text: string,
  tabIds: number[],
): { id: number; category: TabCategory; confidence: number }[] {
  try {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
    const parsed = JSON.parse(jsonMatch[1]!.trim());
    
    if (!Array.isArray(parsed)) return [];
    
    return parsed
      .filter((item: any) => item.id !== undefined && item.category && CATEGORIES.includes(item.category))
      .map((item: any) => ({
        id: Number(item.id),
        category: item.category as TabCategory,
        confidence: Math.min(1, Math.max(0, Number(item.confidence) || 0.5)),
      }));
  } catch {
    return [];
  }
}

/**
 * Parse AI search response.
 */
export function parseSearchResponse(
  text: string,
): { id: number; relevance: number; reason: string }[] {
  try {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
    const parsed = JSON.parse(jsonMatch[1]!.trim());
    
    if (!Array.isArray(parsed)) return [];
    
    return parsed
      .filter((item: any) => item.id !== undefined)
      .map((item: any) => ({
        id: Number(item.id),
        relevance: Math.min(1, Math.max(0, Number(item.relevance) || 0.5)),
        reason: String(item.reason || ''),
      }))
      .sort((a: any, b: any) => b.relevance - a.relevance);
  } catch {
    return [];
  }
}
