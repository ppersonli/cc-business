import { ref } from 'vue';
import type { ClassificationResult, SearchResult, TabInfo } from '~/utils/ai-prompts';
import { classifyTabsAI, searchTabsAI, loadAISettings } from '~/utils/ai-client';
import { canClassify, canSearch, incrementClassifyUsage, incrementSearchUsage } from '~/utils/subscription';

const CATEGORIES = ['work', 'research', 'social', 'shopping', 'entertainment', 'news', 'other'] as const;

/**
 * URL-pattern fallback classification (used when no API key or rate limited).
 */
function classifyByPattern(tabs: TabInfo[]): ClassificationResult[] {
  return tabs.map(tab => {
    const url = tab.url.toLowerCase();
    const title = tab.title.toLowerCase();
    const combined = `${url} ${title}`;
    let category = 'other';
    let confidence = 0.7;

    if (/github|gitlab|jira|slack|trello|asana|notion|linear|docs\.google|figma/.test(combined)) {
      category = 'work'; confidence = 0.9;
    } else if (/stackoverflow|mdn|wiki|dev\.to|medium|arxiv|huggingface|docs\./.test(combined)) {
      category = 'research'; confidence = 0.85;
    } else if (/twitter|x\.com|facebook|reddit|instagram|linkedin|mastodon|discord/.test(combined)) {
      category = 'social'; confidence = 0.9;
    } else if (/amazon|ebay|shop|etsy|aliexpress|walmart|cart/.test(combined)) {
      category = 'shopping'; confidence = 0.85;
    } else if (/youtube|netflix|twitch|spotify|vimeo|tiktok|hulu/.test(combined)) {
      category = 'entertainment'; confidence = 0.85;
    } else if (/news|bbc|cnn|reuters|nytimes|guardian|bloomberg/.test(combined)) {
      category = 'news'; confidence = 0.8;
    }

    return { id: tab.id, category, confidence };
  });
}

/**
 * Simple keyword search fallback.
 */
function searchByKeyword(query: string, tabs: TabInfo[]): SearchResult[] {
  const queryLower = query.toLowerCase();
  return tabs
    .map(tab => {
      const titleMatch = tab.title.toLowerCase().includes(queryLower);
      const urlMatch = tab.url.toLowerCase().includes(queryLower);
      if (titleMatch || urlMatch) {
        return {
          id: tab.id,
          relevance: titleMatch ? 0.9 : 0.7,
          reason: titleMatch ? `Title matches "${query}"` : `URL matches "${query}"`,
        };
      }
      return null;
    })
    .filter((r): r is SearchResult => r !== null)
    .sort((a, b) => b.relevance - a.relevance);
}

export function useAI() {
  const classifications = ref<Map<number, string>>(new Map());
  const searchResults = ref<SearchResult[]>([]);
  const loading = ref(false);
  const hasApiKey = ref(false);
  const error = ref<string | null>(null);

  /**
   * Classify tabs. Tries AI first (if key configured + rate limit OK), falls back to patterns.
   */
  async function classifyTabs(tabs: TabInfo[]): Promise<ClassificationResult[]> {
    loading.value = true;
    error.value = null;

    try {
      const settings = await loadAISettings();
      hasApiKey.value = !!settings;

      let results: ClassificationResult[];

      if (settings) {
        const rateCheck = await canClassify();
        if (rateCheck.allowed) {
          try {
            results = await classifyTabsAI(tabs, settings);
            await incrementClassifyUsage();
          } catch (e: any) {
            // AI call failed — fall back to pattern matching
            console.warn('AI classification failed, using pattern fallback:', e.message);
            results = classifyByPattern(tabs);
          }
        } else {
          results = classifyByPattern(tabs);
        }
      } else {
        results = classifyByPattern(tabs);
      }

      const newMap = new Map<number, string>();
      for (const r of results) newMap.set(r.id, r.category);
      classifications.value = newMap;

      return results;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Search tabs. Tries AI first, falls back to keyword matching.
   */
  async function searchTabs(query: string, tabs: TabInfo[]): Promise<SearchResult[]> {
    loading.value = true;
    error.value = null;

    try {
      const settings = await loadAISettings();
      hasApiKey.value = !!settings;

      let results: SearchResult[];

      if (settings) {
        const rateCheck = await canSearch();
        if (rateCheck.allowed) {
          try {
            results = await searchTabsAI(query, tabs, settings);
            await incrementSearchUsage();
          } catch (e: any) {
            console.warn('AI search failed, using keyword fallback:', e.message);
            results = searchByKeyword(query, tabs);
          }
        } else {
          results = searchByKeyword(query, tabs);
        }
      } else {
        results = searchByKeyword(query, tabs);
      }

      searchResults.value = results;
      return results;
    } finally {
      loading.value = false;
    }
  }

  return { classifications, searchResults, loading, hasApiKey, error, classifyTabs, searchTabs };
}
