export interface TabInfo {
  id: number;
  title: string;
  url: string;
}

export interface ClassificationResult {
  id: number;
  category: string;
  confidence: number;
}

export interface SearchResult {
  id: number;
  relevance: number;
  reason: string;
}

export function buildClassificationPrompt(tabs: TabInfo[]): string {
  const tabList = tabs.map(t => `${t.id}: ${t.title} (${t.url})`).join('\n');
  return `Classify these browser tabs into categories. Return a JSON array only.

Categories: work, research, social, shopping, entertainment, news, other

Tabs:
${tabList}

Return format: [{"id": tabId, "category": "work", "confidence": 0.95}]`;
}

export function buildSearchPrompt(query: string, tabs: TabInfo[]): string {
  const tabList = tabs.map(t => `${t.id}: ${t.title} (${t.url})`).join('\n');
  return `User is looking for a specific tab. Find the most relevant matches.

Query: "${query}"

Open tabs:
${tabList}

Return format: [{"id": tabId, "relevance": 0.95, "reason": "why this matches"}]
Sort by relevance descending. Return a JSON array only.`;
}

export function parseClassificationResponse(response: string): ClassificationResult[] {
  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]) as ClassificationResult[];
  } catch {
    return [];
  }
}

export function parseSearchResponse(response: string): SearchResult[] {
  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]) as SearchResult[];
  } catch {
    return [];
  }
}
