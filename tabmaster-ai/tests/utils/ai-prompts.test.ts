import { describe, it, expect } from 'vitest';
import {
  buildClassificationPrompt,
  buildSearchPrompt,
  parseClassificationResponse,
  parseSearchResponse,
} from '~/utils/ai-prompts';

describe('utils/ai-prompts', () => {
  describe('buildClassificationPrompt', () => {
    it('includes all tab IDs, titles, and URLs', () => {
      const tabs = [
        { id: 1, title: 'GitHub', url: 'https://github.com' },
        { id: 2, title: 'YouTube', url: 'https://youtube.com' },
      ];
      const prompt = buildClassificationPrompt(tabs);

      expect(prompt).toContain('1: GitHub (https://github.com)');
      expect(prompt).toContain('2: YouTube (https://youtube.com)');
      expect(prompt).toContain('work, research, social, shopping, entertainment, news, other');
    });

    it('returns expected format instruction', () => {
      const tabs = [{ id: 1, title: 'Test', url: 'https://test.com' }];
      const prompt = buildClassificationPrompt(tabs);
      expect(prompt).toContain('Return format: [{"id": tabId, "category": "work", "confidence": 0.95}]');
    });
  });

  describe('buildSearchPrompt', () => {
    it('includes the user query', () => {
      const tabs = [{ id: 1, title: 'React Docs', url: 'https://react.dev' }];
      const prompt = buildSearchPrompt('react hooks', tabs);
      expect(prompt).toContain('Query: "react hooks"');
    });

    it('includes all tabs in the prompt', () => {
      const tabs = [
        { id: 1, title: 'React Docs', url: 'https://react.dev' },
        { id: 2, title: 'Vue Docs', url: 'https://vuejs.org' },
      ];
      const prompt = buildSearchPrompt('docs', tabs);
      expect(prompt).toContain('1: React Docs (https://react.dev)');
      expect(prompt).toContain('2: Vue Docs (https://vuejs.org)');
    });
  });

  describe('parseClassificationResponse', () => {
    it('parses valid JSON array', () => {
      const response = '[{"id":1,"category":"work","confidence":0.95}]';
      const result = parseClassificationResponse(response);
      expect(result).toEqual([{ id: 1, category: 'work', confidence: 0.95 }]);
    });

    it('parses JSON embedded in surrounding text', () => {
      const response = 'Here are the classifications:\n[{"id":1,"category":"research","confidence":0.8}]';
      const result = parseClassificationResponse(response);
      expect(result).toEqual([{ id: 1, category: 'research', confidence: 0.8 }]);
    });

    it('returns empty array for invalid JSON', () => {
      const result = parseClassificationResponse('not json at all');
      expect(result).toEqual([]);
    });

    it('returns empty array for empty string', () => {
      const result = parseClassificationResponse('');
      expect(result).toEqual([]);
    });

    it('handles multiple classifications', () => {
      const response = '[{"id":1,"category":"work","confidence":0.9},{"id":2,"category":"social","confidence":0.85},{"id":3,"category":"other","confidence":0.5}]';
      const result = parseClassificationResponse(response);
      expect(result).toHaveLength(3);
    });
  });

  describe('parseSearchResponse', () => {
    it('parses valid JSON array', () => {
      const response = '[{"id":1,"relevance":0.95,"reason":"matches query"}]';
      const result = parseSearchResponse(response);
      expect(result).toEqual([{ id: 1, relevance: 0.95, reason: 'matches query' }]);
    });

    it('returns empty array for invalid JSON', () => {
      const result = parseSearchResponse('error occurred');
      expect(result).toEqual([]);
    });

    it('handles multiple results', () => {
      const response = '[{"id":1,"relevance":0.95,"reason":"exact"},{"id":2,"relevance":0.7,"reason":"partial"}]';
      const result = parseSearchResponse(response);
      expect(result).toHaveLength(2);
      expect(result[0].relevance).toBeGreaterThan(result[1].relevance);
    });
  });
});
