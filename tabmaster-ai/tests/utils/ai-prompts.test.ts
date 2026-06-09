import { describe, it, expect } from 'vitest';
import {
  buildClassificationPrompt,
  buildSearchPrompt,
  parseClassificationResponse,
  parseSearchResponse,
  CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
} from '../../utils/ai-prompts';
import type { TabInfo } from '../../utils/tab-utils';

const mockTabs: TabInfo[] = [
  { id: 1, title: 'React Docs', url: 'https://react.dev', pinned: false, windowId: 1, active: false },
  { id: 2, title: 'Twitter / Home', url: 'https://twitter.com', pinned: false, windowId: 1, active: false },
];

describe('buildClassificationPrompt', () => {
  it('includes all tab info', () => {
    const prompt = buildClassificationPrompt(mockTabs);
    expect(prompt).toContain('1: React Docs (https://react.dev)');
    expect(prompt).toContain('2: Twitter / Home (https://twitter.com)');
  });

  it('includes category list', () => {
    const prompt = buildClassificationPrompt(mockTabs);
    expect(prompt).toContain('work');
    expect(prompt).toContain('social');
    expect(prompt).toContain('entertainment');
  });

  it('requests JSON output', () => {
    const prompt = buildClassificationPrompt(mockTabs);
    expect(prompt).toContain('JSON array');
  });
});

describe('buildSearchPrompt', () => {
  it('includes query and tabs', () => {
    const prompt = buildSearchPrompt('react article', mockTabs);
    expect(prompt).toContain('react article');
    expect(prompt).toContain('React Docs');
  });

  it('requests JSON output', () => {
    const prompt = buildSearchPrompt('test', mockTabs);
    expect(prompt).toContain('JSON array');
  });
});

describe('parseClassificationResponse', () => {
  it('parses valid JSON response', () => {
    const response = '[{"id": 1, "category": "work", "confidence": 0.95}]';
    const result = parseClassificationResponse(response, [1]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
    expect(result[0].category).toBe('work');
    expect(result[0].confidence).toBe(0.95);
  });

  it('parses JSON in markdown code fences', () => {
    const response = '```json\n[{"id": 1, "category": "social", "confidence": 0.8}]\n```';
    const result = parseClassificationResponse(response, [1]);
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('social');
  });

  it('handles invalid JSON gracefully', () => {
    const result = parseClassificationResponse('not json', [1]);
    expect(result).toHaveLength(0);
  });

  it('filters invalid categories', () => {
    const response = '[{"id": 1, "category": "invalid", "confidence": 0.9}]';
    const result = parseClassificationResponse(response, [1]);
    expect(result).toHaveLength(0);
  });

  it('normalizes confidence to 0-1 range', () => {
    const response = '[{"id": 1, "category": "work", "confidence": 1.5}]';
    const result = parseClassificationResponse(response, [1]);
    expect(result[0].confidence).toBe(1);
  });
});

describe('parseSearchResponse', () => {
  it('parses valid JSON response', () => {
    const response = '[{"id": 1, "relevance": 0.9, "reason": "matches react"}]';
    const result = parseSearchResponse(response);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
    expect(result[0].reason).toBe('matches react');
  });

  it('sorts by relevance descending', () => {
    const response = '[{"id": 2, "relevance": 0.5}, {"id": 1, "relevance": 0.9}]';
    const result = parseSearchResponse(response);
    expect(result[0].relevance).toBe(0.9);
    expect(result[1].relevance).toBe(0.5);
  });

  it('handles invalid JSON gracefully', () => {
    const result = parseSearchResponse('not json');
    expect(result).toHaveLength(0);
  });
});

describe('constants', () => {
  it('has 7 categories', () => {
    expect(CATEGORIES).toHaveLength(7);
  });

  it('has labels for all categories', () => {
    for (const cat of CATEGORIES) {
      expect(CATEGORY_LABELS[cat]).toBeTruthy();
    }
  });

  it('has icons for all categories', () => {
    for (const cat of CATEGORIES) {
      expect(CATEGORY_ICONS[cat]).toBeTruthy();
    }
  });
});
