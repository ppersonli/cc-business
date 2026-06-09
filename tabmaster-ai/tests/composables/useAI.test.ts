import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAI } from '~/composables/useAI';

describe('composables/useAI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).browser.storage.local.data = {};
    vi.stubGlobal('fetch', vi.fn());
  });

  describe('classifyTabs', () => {
    const tabs = [
      { id: 1, title: 'GitHub Repo', url: 'https://github.com/user/repo' },
      { id: 2, title: 'YouTube Video', url: 'https://youtube.com/watch' },
      { id: 3, title: 'Random Site', url: 'https://example.com' },
    ];

    it('uses URL pattern classification when no API key', async () => {
      const { classifyTabs, classifications } = useAI();
      const results = await classifyTabs(tabs);

      expect(results).toHaveLength(3);
      expect(classifications.value.get(1)).toBe('work');
      expect(classifications.value.get(2)).toBe('entertainment');
      expect(classifications.value.get(3)).toBe('other');
    });

    it('classifies social media correctly', async () => {
      const { classifyTabs } = useAI();
      const socialTabs = [
        { id: 1, title: 'Twitter', url: 'https://twitter.com/home' },
        { id: 2, title: 'Reddit', url: 'https://reddit.com/r/programming' },
        { id: 3, title: 'LinkedIn', url: 'https://linkedin.com/feed' },
      ];
      const results = await classifyTabs(socialTabs);
      expect(results.every(r => r.category === 'social')).toBe(true);
    });

    it('classifies research sites correctly', async () => {
      const { classifyTabs } = useAI();
      const researchTabs = [
        { id: 1, title: 'Stack Overflow', url: 'https://stackoverflow.com/questions' },
        { id: 2, title: 'MDN Docs', url: 'https://developer.mozilla.org/en-US' },
        { id: 3, title: 'Dev.to', url: 'https://dev.to/articles' },
      ];
      const results = await classifyTabs(researchTabs);
      expect(results.every(r => r.category === 'research')).toBe(true);
    });

    it('classifies shopping sites correctly', async () => {
      const { classifyTabs } = useAI();
      const shopTabs = [
        { id: 1, title: 'Amazon', url: 'https://amazon.com/dp/B08N5WRWNW' },
        { id: 2, title: 'eBay', url: 'https://ebay.com/itm/123' },
      ];
      const results = await classifyTabs(shopTabs);
      expect(results.every(r => r.category === 'shopping')).toBe(true);
    });

    it('classifies news sites correctly', async () => {
      const { classifyTabs } = useAI();
      const newsTabs = [
        { id: 1, title: 'BBC News', url: 'https://bbc.com/news' },
        { id: 2, title: 'CNN', url: 'https://cnn.com/2026/06/09' },
      ];
      const results = await classifyTabs(newsTabs);
      expect(results.every(r => r.category === 'news')).toBe(true);
    });

    it('falls back to pattern when API key exists but AI call fails', async () => {
      // Store a fake API key
      await browser.storage.local.set({
        'tabmaster-ai-settings': { apiKey: 'sk-test', model: 'gpt-4o-mini', provider: 'openai' },
      });

      // AI call fails with network error
      (fetch as any).mockRejectedValue(new TypeError('Failed to fetch'));

      const { classifyTabs, classifications } = useAI();
      const results = await classifyTabs(tabs);

      // Should still classify via fallback
      expect(results).toHaveLength(3);
      expect(classifications.value.get(1)).toBe('work');
    });

    it('uses AI when API key is available and rate limit allows', async () => {
      await browser.storage.local.set({
        'tabmaster-ai-settings': { apiKey: 'sk-test', model: 'gpt-4o-mini', provider: 'openai' },
      });

      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: '[{"id":1,"category":"work","confidence":0.95},{"id":2,"category":"entertainment","confidence":0.9},{"id":3,"category":"other","confidence":0.7}]',
            },
          }],
        }),
      });

      const { classifyTabs, classifications } = useAI();
      const results = await classifyTabs(tabs);

      expect(results).toHaveLength(3);
      expect(classifications.value.get(1)).toBe('work');
      expect(fetch).toHaveBeenCalled();
    });

    it('sets loading state during classification', async () => {
      const { classifyTabs, loading } = useAI();
      expect(loading.value).toBe(false);

      const promise = classifyTabs(tabs);
      expect(loading.value).toBe(true);

      await promise;
      expect(loading.value).toBe(false);
    });
  });

  describe('searchTabs', () => {
    const tabs = [
      { id: 1, title: 'React Hooks Guide', url: 'https://react.dev/hooks' },
      { id: 2, title: 'Vue 3 Documentation', url: 'https://vuejs.org/guide' },
      { id: 3, title: 'Angular Basics', url: 'https://angular.io/start' },
    ];

    it('matches by title with keyword search', async () => {
      const { searchTabs, searchResults } = useAI();
      await searchTabs('react', tabs);

      expect(searchResults.value).toHaveLength(1);
      expect(searchResults.value[0].id).toBe(1);
      expect(searchResults.value[0].relevance).toBe(0.9);
    });

    it('matches by URL with keyword search', async () => {
      const { searchTabs, searchResults } = useAI();
      await searchTabs('angular.io', tabs);

      expect(searchResults.value).toHaveLength(1);
      expect(searchResults.value[0].id).toBe(3);
    });

    it('returns empty for no matches', async () => {
      const { searchTabs, searchResults } = useAI();
      await searchTabs('python', tabs);

      expect(searchResults.value).toHaveLength(0);
    });

    it('sorts by relevance (title match > URL match)', async () => {
      const { searchTabs, searchResults } = useAI();
      await searchTabs('vue', tabs);

      expect(searchResults.value.length).toBeGreaterThan(0);
      expect(searchResults.value[0].relevance).toBeGreaterThanOrEqual(searchResults.value[searchResults.value.length - 1]?.relevance ?? 0);
    });

    it('uses AI search when API key is available', async () => {
      await browser.storage.local.set({
        'tabmaster-ai-settings': { apiKey: 'sk-test', model: 'gpt-4o-mini', provider: 'openai' },
      });

      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: '[{"id":1,"relevance":0.95,"reason":"React hooks match query"}]',
            },
          }],
        }),
      });

      const { searchTabs, searchResults } = useAI();
      await searchTabs('react hooks', tabs);

      expect(searchResults.value).toHaveLength(1);
      expect(searchResults.value[0].id).toBe(1);
      expect(fetch).toHaveBeenCalled();
    });

    it('falls back to keyword search when AI fails', async () => {
      await browser.storage.local.set({
        'tabmaster-ai-settings': { apiKey: 'sk-test', model: 'gpt-4o-mini', provider: 'openai' },
      });

      (fetch as any).mockRejectedValue(new Error('network'));

      const { searchTabs, searchResults } = useAI();
      await searchTabs('react', tabs);

      expect(searchResults.value).toHaveLength(1);
      expect(searchResults.value[0].id).toBe(1);
    });
  });

  describe('hasApiKey', () => {
    it('is false when no API key configured', async () => {
      const { classifyTabs, hasApiKey } = useAI();
      await classifyTabs([]);
      expect(hasApiKey.value).toBe(false);
    });

    it('is true when API key is configured', async () => {
      await browser.storage.local.set({
        'tabmaster-ai-settings': { apiKey: 'sk-test', model: 'gpt-4o-mini', provider: 'openai' },
      });

      const { classifyTabs, hasApiKey } = useAI();
      await classifyTabs([]);
      expect(hasApiKey.value).toBe(true);
    });
  });
});
