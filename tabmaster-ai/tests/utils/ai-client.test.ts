import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  loadAISettings,
  saveAISettings,
  clearAISettings,
  classifyTabsAI,
  searchTabsAI,
  type AISettings,
} from '~/utils/ai-client';

describe('utils/ai-client', () => {
  const settings: AISettings = { apiKey: 'sk-test-key', model: 'gpt-4o-mini', provider: 'openai' };

  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).browser.storage.local.data = {};
    vi.stubGlobal('fetch', vi.fn());
  });

  describe('loadAISettings', () => {
    it('returns null when no settings stored', async () => {
      const result = await loadAISettings();
      expect(result).toBeNull();
    });

    it('returns null when apiKey is empty', async () => {
      await browser.storage.local.set({ 'tabmaster-ai-settings': { apiKey: '', model: 'gpt-4o-mini', provider: 'openai' } });
      const result = await loadAISettings();
      expect(result).toBeNull();
    });

    it('returns settings when stored', async () => {
      await browser.storage.local.set({ 'tabmaster-ai-settings': settings });
      const result = await loadAISettings();
      expect(result).toEqual(settings);
    });
  });

  describe('saveAISettings', () => {
    it('saves settings to chrome.storage.local', async () => {
      await saveAISettings(settings);
      const data = await browser.storage.local.get('tabmaster-ai-settings');
      expect(data['tabmaster-ai-settings']).toEqual(settings);
    });
  });

  describe('clearAISettings', () => {
    it('removes settings from storage', async () => {
      await browser.storage.local.set({ 'tabmaster-ai-settings': settings });
      await clearAISettings();
      const result = await loadAISettings();
      expect(result).toBeNull();
    });
  });

  describe('classifyTabsAI', () => {
    const tabs = [
      { id: 1, title: 'GitHub', url: 'https://github.com' },
      { id: 2, title: 'YouTube', url: 'https://youtube.com' },
    ];

    it('sends correct prompt to OpenAI API', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '[{"id":1,"category":"work","confidence":0.95},{"id":2,"category":"entertainment","confidence":0.9}]' } }],
        }),
      });

      const results = await classifyTabsAI(tabs, settings);
      expect(results).toHaveLength(2);
      expect(results[0].category).toBe('work');
      expect(results[1].category).toBe('entertainment');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer sk-test-key',
          }),
        }),
      );
    });

    it('throws invalid_key on 401', async () => {
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'Invalid API key' } }),
      });

      await expect(classifyTabsAI(tabs, settings)).rejects.toMatchObject({ code: 'invalid_key' });
    });

    it('throws rate_limit on 429', async () => {
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: { message: 'Rate limit' } }),
      });

      await expect(classifyTabsAI(tabs, settings)).rejects.toMatchObject({ code: 'rate_limit' });
    });

    it('throws network error on fetch failure', async () => {
      (fetch as any).mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(classifyTabsAI(tabs, settings)).rejects.toMatchObject({ code: 'network' });
    });

    it('throws no_key when no settings provided and none stored', async () => {
      await expect(classifyTabsAI(tabs, null)).rejects.toMatchObject({ code: 'no_key' });
    });

    it('handles malformed JSON response gracefully', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'not valid json at all' } }],
        }),
      });

      const results = await classifyTabsAI(tabs, settings);
      expect(results).toEqual([]);
    });
  });

  describe('searchTabsAI', () => {
    const tabs = [
      { id: 1, title: 'React Hooks Guide', url: 'https://react.dev' },
      { id: 2, title: 'Vue 3 Docs', url: 'https://vuejs.org' },
    ];

    it('sends search prompt and parses results', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '[{"id":1,"relevance":0.95,"reason":"React hooks match"}]' } }],
        }),
      });

      const results = await searchTabsAI('react hooks', tabs, settings);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(1);
      expect(results[0].relevance).toBe(0.95);
    });

    it('returns empty array for empty search response', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '[]' } }],
        }),
      });

      const results = await searchTabsAI('nonexistent', tabs, settings);
      expect(results).toEqual([]);
    });
  });
});
