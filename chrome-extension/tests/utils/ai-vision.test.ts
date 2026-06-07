import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeScreenshot } from '~/utils/ai-vision';
import type { AnalysisMode } from '~/utils/ai-vision';

describe('utils/ai-vision', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
  });

  const validImageDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const openaiSettings = { provider: 'openai' as const, apiKey: 'sk-test', model: 'gpt-4o' };
  const claudeSettings = { provider: 'claude' as const, apiKey: 'sk-ant-test', model: 'claude-sonnet-4-20250514' };

  describe('analyzeScreenshot — OpenAI provider', () => {
    it('returns parsed result on success', async () => {
      const aiResponse = JSON.stringify({ content: 'A blue button on a white background' });
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ choices: [{ message: { content: aiResponse } }] }),
      });

      const result = await analyzeScreenshot(validImageDataUrl, 'describe', openaiSettings);

      expect(result.content).toBe('A blue button on a white background');
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer sk-test',
          }),
        })
      );
    });

    it('sends image_url with detail: high', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ choices: [{ message: { content: '{"content":"test"}' } }] }),
      });

      await analyzeScreenshot(validImageDataUrl, 'describe', openaiSettings);

      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(body.messages[0].content[1]).toEqual({
        type: 'image_url',
        image_url: { url: validImageDataUrl, detail: 'high' },
      });
    });

    it('uses correct model from settings', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ choices: [{ message: { content: '{"content":"test"}' } }] }),
      });

      await analyzeScreenshot(validImageDataUrl, 'code', { ...openaiSettings, model: 'gpt-4o-mini' });

      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(body.model).toBe('gpt-4o-mini');
    });

    it('uses different prompts for each mode', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ choices: [{ message: { content: '{"content":"test"}' } }] }),
      });

      await analyzeScreenshot(validImageDataUrl, 'describe', openaiSettings);
      const describeBody = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(describeBody.messages[0].content[0].text).toContain('description');

      await analyzeScreenshot(validImageDataUrl, 'code', openaiSettings);
      const codeBody = JSON.parse(fetchSpy.mock.calls[1][1].body);
      expect(codeBody.messages[0].content[0].text).toContain('HTML/CSS');

      await analyzeScreenshot(validImageDataUrl, 'ui-review', openaiSettings);
      const reviewBody = JSON.parse(fetchSpy.mock.calls[2][1].body);
      expect(reviewBody.messages[0].content[0].text).toContain('UX');
    });

    it('throws network error on fetch failure', async () => {
      fetchSpy.mockRejectedValue(new Error('fetch failed'));

      await expect(
        analyzeScreenshot(validImageDataUrl, 'describe', openaiSettings)
      ).rejects.toMatchObject({ code: 'network', message: 'Network error — check your connection' });
    });

    it('throws invalid_key on 401', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'Unauthorized' } }),
      });

      await expect(
        analyzeScreenshot(validImageDataUrl, 'describe', openaiSettings)
      ).rejects.toMatchObject({ code: 'invalid_key' });
    });

    it('throws rate_limit on 429', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: { message: 'Rate limited' } }),
      });

      await expect(
        analyzeScreenshot(validImageDataUrl, 'describe', openaiSettings)
      ).rejects.toMatchObject({ code: 'rate_limit' });
    });

    it('throws quota on 402', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 402,
        json: async () => ({ error: { code: 'insufficient_quota', message: 'Quota exceeded' } }),
      });

      await expect(
        analyzeScreenshot(validImageDataUrl, 'describe', openaiSettings)
      ).rejects.toMatchObject({ code: 'quota' });
    });

    it('throws unknown on other HTTP errors', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: { message: 'Internal server error' } }),
      });

      await expect(
        analyzeScreenshot(validImageDataUrl, 'describe', openaiSettings)
      ).rejects.toMatchObject({ code: 'unknown', message: 'Internal server error' });
    });

    it('throws unknown error when response has no content', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ choices: [{ message: { content: '' } }] }),
      });

      await expect(
        analyzeScreenshot(validImageDataUrl, 'describe', openaiSettings)
      ).rejects.toMatchObject({ code: 'unknown', message: 'Empty response from API' });
    });

    it('throws unknown error when choices is empty', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ choices: [] }),
      });

      await expect(
        analyzeScreenshot(validImageDataUrl, 'describe', openaiSettings)
      ).rejects.toMatchObject({ code: 'unknown', message: 'Empty response from API' });
    });
  });

  describe('analyzeScreenshot — Claude provider', () => {
    it('returns parsed result on success', async () => {
      const aiResponse = JSON.stringify({ content: 'A login form with username and password fields' });
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ content: [{ text: aiResponse }] }),
      });

      const result = await analyzeScreenshot(validImageDataUrl, 'describe', claudeSettings);

      expect(result.content).toBe('A login form with username and password fields');
      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-api-key': 'sk-ant-test',
            'anthropic-version': '2023-06-01',
          }),
        })
      );
    });

    it('sends base64 image in correct format', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ content: [{ text: '{"content":"test"}' }] }),
      });

      await analyzeScreenshot(validImageDataUrl, 'describe', claudeSettings);

      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(body.messages[0].content[0]).toEqual({
        type: 'image',
        source: { type: 'base64', media_type: 'image/png', data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' },
      });
    });

    it('converts jpg to image/jpeg media type', async () => {
      const jpgDataUrl = 'data:image/jpg;base64,/9j/4AAQSkZJRg==';
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ content: [{ text: '{"content":"test"}' }] }),
      });

      await analyzeScreenshot(jpgDataUrl, 'describe', claudeSettings);

      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(body.messages[0].content[0].source.media_type).toBe('image/jpeg');
    });

    it('throws invalid image data for non-base64 input', async () => {
      await expect(
        analyzeScreenshot('not-a-data-url', 'describe', claudeSettings)
      ).rejects.toMatchObject({ code: 'unknown', message: 'Invalid image data' });
    });

    it('throws network error on fetch failure', async () => {
      fetchSpy.mockRejectedValue(new Error('fetch failed'));

      await expect(
        analyzeScreenshot(validImageDataUrl, 'describe', claudeSettings)
      ).rejects.toMatchObject({ code: 'network', message: 'Network error — check your connection' });
    });

    it('throws invalid_key on 401', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'Unauthorized' } }),
      });

      await expect(
        analyzeScreenshot(validImageDataUrl, 'describe', claudeSettings)
      ).rejects.toMatchObject({ code: 'invalid_key' });
    });

    it('throws rate_limit on 429', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: { message: 'Rate limited' } }),
      });

      await expect(
        analyzeScreenshot(validImageDataUrl, 'describe', claudeSettings)
      ).rejects.toMatchObject({ code: 'rate_limit' });
    });

    it('throws quota on 402', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 402,
        json: async () => ({ error: { code: 'insufficient_quota', message: 'Quota exceeded' } }),
      });

      await expect(
        analyzeScreenshot(validImageDataUrl, 'describe', claudeSettings)
      ).rejects.toMatchObject({ code: 'quota' });
    });

    it('throws unknown when content array is empty', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ content: [] }),
      });

      await expect(
        analyzeScreenshot(validImageDataUrl, 'describe', claudeSettings)
      ).rejects.toMatchObject({ code: 'unknown', message: 'Empty response from API' });
    });
  });

  describe('response parsing', () => {
    it('parses JSON in markdown code fences', async () => {
      const fencedResponse = '```json\n{"content": "Fenced description"}\n```';
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ choices: [{ message: { content: fencedResponse } }] }),
      });

      const result = await analyzeScreenshot(validImageDataUrl, 'describe', openaiSettings);
      expect(result.content).toBe('Fenced description');
    });

    it('parses plain code fences without language tag', async () => {
      const plainFenced = '```\n{"content": "Plain fenced"}\n```';
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ choices: [{ message: { content: plainFenced } }] }),
      });

      const result = await analyzeScreenshot(validImageDataUrl, 'describe', openaiSettings);
      expect(result.content).toBe('Plain fenced');
    });

    it('falls back to raw text when not valid JSON', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ choices: [{ message: { content: 'Just plain text description' } }] }),
      });

      const result = await analyzeScreenshot(validImageDataUrl, 'describe', openaiSettings);
      expect(result.content).toBe('Just plain text description');
    });

    it('uses raw text as fallback when JSON has no content field', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ choices: [{ message: { content: '{"other": "field"}' } }] }),
      });

      const result = await analyzeScreenshot(validImageDataUrl, 'describe', openaiSettings);
      expect(result.content).toBe('{"other": "field"}');
    });
  });

  describe('error parsing edge cases', () => {
    it('handles HTTP error with non-JSON body', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => { throw new Error('not json'); },
      });

      await expect(
        analyzeScreenshot(validImageDataUrl, 'describe', openaiSettings)
      ).rejects.toMatchObject({ code: 'unknown', message: 'HTTP 502' });
    });

    it('handles error with message in body.message (not body.error.message)', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Bad request from body' }),
      });

      await expect(
        analyzeScreenshot(validImageDataUrl, 'describe', openaiSettings)
      ).rejects.toMatchObject({ code: 'unknown', message: 'Bad request from body' });
    });
  });
});
