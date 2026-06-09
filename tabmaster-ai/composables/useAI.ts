import { ref } from 'vue';
import type { ClassificationResult, SearchResult, TabInfo } from '~/utils/ai-prompts';

const CATEGORIES = ['work', 'research', 'social', 'shopping', 'entertainment', 'news', 'other'] as const;

export function useAI() {
  const classifications = ref<Map<number, string>>(new Map());
  const searchResults = ref<SearchResult[]>([]);
  const loading = ref(false);

  async function classifyTabs(tabs: TabInfo[]): Promise<ClassificationResult[]> {
    loading.value = true;
    try {
      // Stub: return mock classifications based on URL patterns
      const results: ClassificationResult[] = tabs.map(tab => {
        const url = tab.url.toLowerCase();
        let category = 'other';
        let confidence = 0.7;

        if (url.includes('github') || url.includes('jira') || url.includes('slack') || url.includes('docs.google')) {
          category = 'work'; confidence = 0.9;
        } else if (url.includes('stackoverflow') || url.includes('mdn') || url.includes('wiki') || url.includes('dev.to')) {
          category = 'research'; confidence = 0.85;
        } else if (url.includes('twitter') || url.includes('facebook') || url.includes('reddit') || url.includes('instagram')) {
          category = 'social'; confidence = 0.9;
        } else if (url.includes('amazon') || url.includes('ebay') || url.includes('shop')) {
          category = 'shopping'; confidence = 0.85;
        } else if (url.includes('youtube') || url.includes('netflix') || url.includes('twitch')) {
          category = 'entertainment'; confidence = 0.85;
        } else if (url.includes('news') || url.includes('bbc') || url.includes('cnn')) {
          category = 'news'; confidence = 0.8;
        }

        return { id: tab.id, category, confidence };
      });

      const newMap = new Map<number, string>();
      for (const r of results) newMap.set(r.id, r.category);
      classifications.value = newMap;

      return results;
    } finally {
      loading.value = false;
    }
  }

  async function searchTabs(query: string, tabs: TabInfo[]): Promise<SearchResult[]> {
    loading.value = true;
    try {
      // Stub: simple keyword matching
      const queryLower = query.toLowerCase();
      const results: SearchResult[] = tabs
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

      searchResults.value = results;
      return results;
    } finally {
      loading.value = false;
    }
  }

  return { classifications, searchResults, loading, classifyTabs, searchTabs };
}
