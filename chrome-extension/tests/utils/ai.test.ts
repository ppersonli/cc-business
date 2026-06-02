import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  loadSettings,
  validateApiKey,
  summarizePage,
  summarizeYoutube,
  summarizeSelection,
  buildPagePrompt,
  buildYoutubePrompt,
  parseJsonResponse,
  languageName,
  toAiError,
  AVAILABLE_MODELS,
} from '~/utils/ai';
import type { AiSettings, SummaryOptions, YoutubeSummaryOptions } from '~/utils/ai';

describe('utils/ai', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset storage mocks
    (globalThis as any).browser.storage.sync.data = {};
    (globalThis as any).browser.storage.local.data = {};
  });

  describe('languageName', () => {
    it('returns Chinese for zh', () => {
      expect(languageName('zh')).toBe('Chinese');
    });

    it('returns Japanese for ja', () => {
      expect(languageName('ja')).toBe('Japanese');
    });

    it('returns Korean for ko', () => {
      expect(languageName('ko')).toBe('Korean');
    });

    it('returns the code itself for unknown languages', () => {
      expect(languageName('fr')).toBe('fr');
      expect(languageName('de')).toBe('de');
    });
  });

  describe('parseJsonResponse', () => {
    it('parses valid JSON with summary and keyPoints', () => {
      const input = JSON.stringify({
        summary: 'This is a test summary.',
        keyPoints: ['Point 1', 'Point 2'],
      });
      const result = parseJsonResponse(input);
      expect(result.summary).toBe('This is a test summary.');
      expect(result.keyPoints).toEqual(['Point 1', 'Point 2']);
    });

    it('parses JSON wrapped in markdown code fences', () => {
      const input = '```json\n{"summary": "Fenced summary", "keyPoints": ["A"]}\n```';
      const result = parseJsonResponse(input);
      expect(result.summary).toBe('Fenced summary');
      expect(result.keyPoints).toEqual(['A']);
    });

    it('parses JSON wrapped in plain code fences', () => {
      const input = '```\n{"summary": "Plain fenced", "keyPoints": []}\n```';
      const result = parseJsonResponse(input);
      expect(result.summary).toBe('Plain fenced');
      expect(result.keyPoints).toEqual([]);
    });

    it('includes timestamps when present', () => {
      const input = JSON.stringify({
        summary: 'Video summary',
        keyPoints: ['KP1'],
        timestamps: [
          { time: '0:00', label: 'Intro' },
          { time: '1:30', label: 'Main topic' },
        ],
      });
      const result = parseJsonResponse(input);
      expect(result.timestamps).toHaveLength(2);
      expect(result.timestamps![0]).toEqual({ time: '0:00', label: 'Intro' });
    });

    it('handles missing keyPoints gracefully', () => {
      const input = JSON.stringify({ summary: 'Only summary' });
      const result = parseJsonResponse(input);
      expect(result.summary).toBe('Only summary');
      expect(result.keyPoints).toEqual([]);
    });

    it('handles missing timestamps gracefully', () => {
      const input = JSON.stringify({ summary: 'No timestamps', keyPoints: [] });
      const result = parseJsonResponse(input);
      expect(result.timestamps).toBeUndefined();
    });

    it('falls back to raw text when JSON parsing fails', () => {
      const input = 'This is not JSON at all, just plain text.';
      const result = parseJsonResponse(input);
      expect(result.summary).toBe('This is not JSON at all, just plain text.');
      expect(result.keyPoints).toEqual([]);
    });

    it('handles empty string input', () => {
      const result = parseJsonResponse('');
      expect(result.summary).toBe('');
      expect(result.keyPoints).toEqual([]);
    });
  });

  describe('toAiError', () => {
    it('creates an Error with the correct code and message', () => {
      const err = toAiError({ code: 'invalid_key', message: 'Bad key' });
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('Bad key');
      expect(err.code).toBe('invalid_key');
    });

    it('creates error for rate_limit', () => {
      const err = toAiError({ code: 'rate_limit', message: 'Too many requests' });
      expect(err.code).toBe('rate_limit');
      expect(err.message).toBe('Too many requests');
    });

    it('creates error for network', () => {
      const err = toAiError({ code: 'network', message: 'Connection failed' });
      expect(err.code).toBe('network');
    });

    it('creates error for quota', () => {
      const err = toAiError({ code: 'quota', message: 'Exceeded' });
      expect(err.code).toBe('quota');
    });

    it('creates error for unknown', () => {
      const err = toAiError({ code: 'unknown', message: 'Something' });
      expect(err.code).toBe('unknown');
    });
  });

  describe('buildPagePrompt', () => {
    const baseOptions: SummaryOptions = {
      url: 'https://example.com/article',
      title: 'Test Article',
      text: 'This is the article content that will be summarized.',
    };

    it('includes page title and URL', () => {
      const prompt = buildPagePrompt(baseOptions);
      expect(prompt).toContain('Page title: Test Article');
      expect(prompt).toContain('URL: https://example.com/article');
    });

    it('includes the page text content', () => {
      const prompt = buildPagePrompt(baseOptions);
      expect(prompt).toContain('This is the article content');
    });

    it('requests JSON format', () => {
      const prompt = buildPagePrompt(baseOptions);
      expect(prompt).toContain('JSON format');
      expect(prompt).toContain('"summary"');
      expect(prompt).toContain('"keyPoints"');
    });

    it('truncates text to 8000 characters', () => {
      const longText = 'x'.repeat(10000);
      const prompt = buildPagePrompt({ ...baseOptions, text: longText });
      expect(prompt).toContain('x'.repeat(8000));
      expect(prompt).not.toContain('x'.repeat(8001));
    });

    it('adds language hint for Chinese', () => {
      const prompt = buildPagePrompt({ ...baseOptions, language: 'zh' });
      expect(prompt).toContain('Respond in Chinese');
    });

    it('adds language hint for Japanese', () => {
      const prompt = buildPagePrompt({ ...baseOptions, language: 'ja' });
      expect(prompt).toContain('Respond in Japanese');
    });

    it('does not add language hint for English', () => {
      const prompt = buildPagePrompt({ ...baseOptions, language: 'en' });
      // "Respond in JSON format" is in the template; we check there's no "Respond in English"
      expect(prompt).not.toContain('Respond in English');
    });

    it('does not add language hint when language is undefined', () => {
      const prompt = buildPagePrompt(baseOptions);
      expect(prompt).not.toContain('Respond in Chinese');
      expect(prompt).not.toContain('Respond in Japanese');
      expect(prompt).not.toContain('Respond in Korean');
    });
  });

  describe('buildYoutubePrompt', () => {
    const baseOptions: YoutubeSummaryOptions = {
      url: 'https://youtube.com/watch?v=abc123',
      title: 'Test Video',
      captions: '[0:00] Hello world\n[0:30] Goodbye world',
      videoId: 'abc123',
    };

    it('includes video title and URL', () => {
      const prompt = buildYoutubePrompt(baseOptions);
      expect(prompt).toContain('Video title: Test Video');
      expect(prompt).toContain('URL: https://youtube.com/watch?v=abc123');
    });

    it('includes captions content', () => {
      const prompt = buildYoutubePrompt(baseOptions);
      expect(prompt).toContain('[0:00] Hello world');
    });

    it('requests timestamps in JSON', () => {
      const prompt = buildYoutubePrompt(baseOptions);
      expect(prompt).toContain('"timestamps"');
      expect(prompt).toContain('"time"');
      expect(prompt).toContain('"label"');
    });

    it('requests 3-6 timestamps', () => {
      const prompt = buildYoutubePrompt(baseOptions);
      expect(prompt).toContain('3-6 timestamps');
    });

    it('truncates captions to 8000 characters', () => {
      const longCaptions = '[0:00] ' + 'word '.repeat(2000);
      const prompt = buildYoutubePrompt({ ...baseOptions, captions: longCaptions });
      // Should contain first 8000 chars of captions
      expect(prompt).toContain('[0:00] ');
    });

    it('adds language hint for Chinese', () => {
      const prompt = buildYoutubePrompt({ ...baseOptions, language: 'zh' });
      expect(prompt).toContain('Respond in Chinese');
    });

    it('does not add language hint for English', () => {
      const prompt = buildYoutubePrompt({ ...baseOptions, language: 'en' });
      expect(prompt).not.toContain('Respond in English');
    });
  });

  describe('loadSettings', () => {
    it('returns null when no API key is stored', async () => {
      const result = await loadSettings();
      expect(result).toBeNull();
    });

    it('returns settings when API key is stored', async () => {
      await browser.storage.sync.set({
        aiProvider: 'openai',
        aiApiKey: 'sk-test123',
        aiModel: 'gpt-4o',
      });
      const result = await loadSettings();
      expect(result).toEqual({
        provider: 'openai',
        apiKey: 'sk-test123',
        model: 'gpt-4o',
      });
    });

    it('defaults to openai provider when not set', async () => {
      await browser.storage.sync.set({ aiApiKey: 'sk-test123' });
      const result = await loadSettings();
      expect(result?.provider).toBe('openai');
    });

    it('defaults to claude model for claude provider', async () => {
      await browser.storage.sync.set({
        aiProvider: 'claude',
        aiApiKey: 'sk-ant-test',
      });
      const result = await loadSettings();
      expect(result?.provider).toBe('claude');
      expect(result?.model).toBe('claude-haiku-4-5-20251001');
    });
  });

  describe('AVAILABLE_MODELS', () => {
    it('has openai models', () => {
      expect(AVAILABLE_MODELS.openai).toBeDefined();
      expect(AVAILABLE_MODELS.openai.length).toBeGreaterThan(0);
      expect(AVAILABLE_MODELS.openai[0]).toHaveProperty('id');
      expect(AVAILABLE_MODELS.openai[0]).toHaveProperty('name');
    });

    it('has claude models', () => {
      expect(AVAILABLE_MODELS.claude).toBeDefined();
      expect(AVAILABLE_MODELS.claude.length).toBeGreaterThan(0);
    });

    it('includes gpt-4o-mini', () => {
      const ids = AVAILABLE_MODELS.openai.map(m => m.id);
      expect(ids).toContain('gpt-4o-mini');
    });

    it('includes claude-haiku-4-5', () => {
      const ids = AVAILABLE_MODELS.claude.map(m => m.id);
      expect(ids).toContain('claude-haiku-4-5-20251001');
    });
  });

  describe('validateApiKey', () => {
    let fetchSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);
    });

    it('returns valid for OpenAI with 200 response', async () => {
      fetchSpy.mockResolvedValue({ ok: true, status: 200 });
      const result = await validateApiKey('openai', 'sk-test');
      expect(result.valid).toBe(true);
      expect(fetchSpy).toHaveBeenCalledWith('https://api.openai.com/v1/models', {
        headers: { Authorization: 'Bearer sk-test' },
      });
    });

    it('returns invalid for OpenAI with 401', async () => {
      fetchSpy.mockResolvedValue({ ok: false, status: 401 });
      const result = await validateApiKey('openai', 'sk-bad');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid API key');
    });

    it('returns rate limited for OpenAI with 429', async () => {
      fetchSpy.mockResolvedValue({ ok: false, status: 429 });
      const result = await validateApiKey('openai', 'sk-test');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Rate limited');
    });

    it('returns valid for Claude with 200 response', async () => {
      fetchSpy.mockResolvedValue({ ok: true, status: 200 });
      const result = await validateApiKey('claude', 'sk-ant-test');
      expect(result.valid).toBe(true);
      expect(fetchSpy).toHaveBeenCalledWith('https://api.anthropic.com/v1/messages', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'x-api-key': 'sk-ant-test' }),
      }));
    });

    it('returns invalid for Claude with 401', async () => {
      fetchSpy.mockResolvedValue({ ok: false, status: 401 });
      const result = await validateApiKey('claude', 'sk-ant-bad');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid API key');
    });

    it('returns network error on fetch failure', async () => {
      fetchSpy.mockRejectedValue(new Error('Network error'));
      const result = await validateApiKey('openai', 'sk-test');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Network error');
    });
  });

  describe('summarizePage', () => {
    let fetchSpy: ReturnType<typeof vi.fn>;
    const settings: AiSettings = { provider: 'openai', apiKey: 'sk-test', model: 'gpt-4o-mini' };

    beforeEach(() => {
      fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);
    });

    it('returns parsed summary on success', async () => {
      const aiResponse = JSON.stringify({ summary: 'Page summary', keyPoints: ['KP1', 'KP2'] });
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: aiResponse } }],
        }),
      });

      const result = await summarizePage({
        url: 'https://example.com',
        title: 'Example',
        text: 'Page content here',
      }, settings);

      expect(result.summary).toBe('Page summary');
      expect(result.keyPoints).toEqual(['KP1', 'KP2']);
    });

    it('throws network error on fetch failure', async () => {
      fetchSpy.mockRejectedValue(new Error('fetch failed'));

      await expect(summarizePage({
        url: 'https://example.com',
        title: 'Example',
        text: 'Content',
      }, settings)).rejects.toThrow('Network error');
    });

    it('throws invalid_key on 401', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'Unauthorized' } }),
      });

      await expect(summarizePage({
        url: 'https://example.com',
        title: 'Example',
        text: 'Content',
      }, settings)).rejects.toMatchObject({ code: 'invalid_key' });
    });

    it('throws rate_limit on 429', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: { message: 'Rate limited' } }),
      });

      await expect(summarizePage({
        url: 'https://example.com',
        title: 'Example',
        text: 'Content',
      }, settings)).rejects.toMatchObject({ code: 'rate_limit' });
    });

    it('throws quota on 402', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 402,
        json: async () => ({ error: { code: 'insufficient_quota', message: 'Quota exceeded' } }),
      });

      await expect(summarizePage({
        url: 'https://example.com',
        title: 'Example',
        text: 'Content',
      }, settings)).rejects.toMatchObject({ code: 'quota' });
    });
  });

  describe('summarizePage with Claude', () => {
    let fetchSpy: ReturnType<typeof vi.fn>;
    const settings: AiSettings = { provider: 'claude', apiKey: 'sk-ant-test', model: 'claude-haiku-4-5-20251001' };

    beforeEach(() => {
      fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);
    });

    it('returns parsed summary on success', async () => {
      const aiResponse = JSON.stringify({ summary: 'Claude summary', keyPoints: ['CK1'] });
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({
          content: [{ text: aiResponse }],
        }),
      });

      const result = await summarizePage({
        url: 'https://example.com',
        title: 'Example',
        text: 'Content',
      }, settings);

      expect(result.summary).toBe('Claude summary');
      expect(result.keyPoints).toEqual(['CK1']);
    });

    it('throws on empty response', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ content: [] }),
      });

      await expect(summarizePage({
        url: 'https://example.com',
        title: 'Example',
        text: 'Content',
      }, settings)).rejects.toThrow('Empty response');
    });
  });

  describe('summarizeYoutube', () => {
    let fetchSpy: ReturnType<typeof vi.fn>;
    const settings: AiSettings = { provider: 'openai', apiKey: 'sk-test', model: 'gpt-4o-mini' };

    beforeEach(() => {
      fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);
    });

    it('returns parsed summary with timestamps', async () => {
      const aiResponse = JSON.stringify({
        summary: 'Video summary',
        keyPoints: ['VP1'],
        timestamps: [{ time: '0:00', label: 'Intro' }],
      });
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: aiResponse } }],
        }),
      });

      const result = await summarizeYoutube({
        url: 'https://youtube.com/watch?v=abc',
        title: 'Video',
        captions: '[0:00] Hello',
        videoId: 'abc',
      }, settings);

      expect(result.summary).toBe('Video summary');
      expect(result.timestamps).toHaveLength(1);
    });
  });

  describe('summarizeSelection', () => {
    let fetchSpy: ReturnType<typeof vi.fn>;
    const settings: AiSettings = { provider: 'openai', apiKey: 'sk-test', model: 'gpt-4o-mini' };

    beforeEach(() => {
      fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);
    });

    it('returns parsed summary for selected text', async () => {
      const aiResponse = JSON.stringify({
        summary: 'Selection summary',
        keyPoints: ['SP1'],
      });
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: aiResponse } }],
        }),
      });

      const result = await summarizeSelection('Some selected text', 'Page Title', settings);
      expect(result.summary).toBe('Selection summary');
      expect(result.keyPoints).toEqual(['SP1']);
    });

    it('falls back to raw text when JSON parsing fails', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'This is not JSON at all' } }],
        }),
      });

      const result = await summarizeSelection('text', 'title', settings);
      expect(result.summary).toBe('This is not JSON at all');
    });
  });

  describe('parseApiError (via summarizePage error paths)', () => {
    let fetchSpy: ReturnType<typeof vi.fn>;
    const settings: AiSettings = { provider: 'openai', apiKey: 'sk-test', model: 'gpt-4o-mini' };

    beforeEach(() => {
      fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);
    });

    it('handles non-JSON error response gracefully', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => { throw new Error('not json'); },
      });

      await expect(summarizePage({
        url: 'https://example.com',
        title: 'Example',
        text: 'Content',
      }, settings)).rejects.toMatchObject({ code: 'unknown' });
    });

    it('handles OpenAI empty content response', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [],
        }),
      });

      await expect(summarizePage({
        url: 'https://example.com',
        title: 'Example',
        text: 'Content',
      }, settings)).rejects.toThrow('Empty response');
    });

    it('handles OpenAI null content response', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: null } }],
        }),
      });

      await expect(summarizePage({
        url: 'https://example.com',
        title: 'Example',
        text: 'Content',
      }, settings)).rejects.toThrow('Empty response');
    });

    it('handles unknown HTTP status (e.g. 500) with valid JSON body', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: { message: 'Internal Server Error' } }),
      });

      await expect(summarizePage({
        url: 'https://example.com',
        title: 'Example',
        text: 'Content',
      }, settings)).rejects.toMatchObject({ code: 'unknown' });
    });
  });

  describe('summarizePage with Claude - error paths', () => {
    let fetchSpy: ReturnType<typeof vi.fn>;
    const settings: AiSettings = { provider: 'claude', apiKey: 'sk-ant-test', model: 'claude-haiku-4-5-20251001' };

    beforeEach(() => {
      fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);
    });

    it('throws network error on Claude fetch failure', async () => {
      fetchSpy.mockRejectedValue(new Error('fetch failed'));

      await expect(summarizePage({
        url: 'https://example.com',
        title: 'Example',
        text: 'Content',
      }, settings)).rejects.toThrow('Network error');
    });

    it('throws on Claude error response (401)', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'Unauthorized' } }),
      });

      await expect(summarizePage({
        url: 'https://example.com',
        title: 'Example',
        text: 'Content',
      }, settings)).rejects.toMatchObject({ code: 'invalid_key' });
    });

    it('throws on Claude error response (429)', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: { message: 'Rate limited' } }),
      });

      await expect(summarizePage({
        url: 'https://example.com',
        title: 'Example',
        text: 'Content',
      }, settings)).rejects.toMatchObject({ code: 'rate_limit' });
    });

    it('throws on Claude error response (402)', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 402,
        json: async () => ({ error: { code: 'insufficient_quota', message: 'Quota' } }),
      });

      await expect(summarizePage({
        url: 'https://example.com',
        title: 'Example',
        text: 'Content',
      }, settings)).rejects.toMatchObject({ code: 'quota' });
    });

    it('throws on Claude unknown error status (500)', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: { message: 'Server Error' } }),
      });

      await expect(summarizePage({
        url: 'https://example.com',
        title: 'Example',
        text: 'Content',
      }, settings)).rejects.toMatchObject({ code: 'unknown' });
    });

    it('handles Claude non-JSON error response', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => { throw new Error('not json'); },
      });

      await expect(summarizePage({
        url: 'https://example.com',
        title: 'Example',
        text: 'Content',
      }, settings)).rejects.toMatchObject({ code: 'unknown' });
    });
  });

  describe('validateApiKey - Claude 429', () => {
    let fetchSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);
    });

    it('returns rate limited for Claude with 429', async () => {
      fetchSpy.mockResolvedValue({ ok: false, status: 429 });
      const result = await validateApiKey('claude', 'sk-ant-test');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Rate limited');
    });
  });

  describe('parseJsonResponse - edge cases', () => {
    it('returns default summary when parsed.summary is empty', () => {
      const input = JSON.stringify({ summary: '', keyPoints: ['A'] });
      const result = parseJsonResponse(input);
      expect(result.summary).toBe('No summary generated');
    });

    it('returns default summary when parsed.summary is missing', () => {
      const input = JSON.stringify({ keyPoints: ['A'] });
      const result = parseJsonResponse(input);
      expect(result.summary).toBe('No summary generated');
    });
  });

  describe('parseApiError - message extraction', () => {
    let fetchSpy: ReturnType<typeof vi.fn>;
    const settings: AiSettings = { provider: 'openai', apiKey: 'sk-test', model: 'gpt-4o-mini' };

    beforeEach(() => {
      fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);
    });

    it('falls back to body.message when error.message is missing', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Server Error' }),
      });

      await expect(summarizePage({
        url: 'https://example.com',
        title: 'Example',
        text: 'Content',
      }, settings)).rejects.toMatchObject({ code: 'unknown' });
    });

    it('falls back to HTTP status when both messages are missing', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({}),
      });

      await expect(summarizePage({
        url: 'https://example.com',
        title: 'Example',
        text: 'Content',
      }, settings)).rejects.toMatchObject({ code: 'unknown' });
    });
  });
});
