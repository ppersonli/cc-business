import { describe, it, expect } from 'vitest';
import {
  validatePostContent,
  getCharLimit,
  isOverLimit,
  getCharCount,
  getRemainingChars,
  PLATFORM_LIMITS,
  adaptContentForPlatform,
  stripHtml,
} from '../platform';

describe('getCharLimit', () => {
  it('returns correct limits for each platform', () => {
    expect(getCharLimit('twitter')).toBe(280);
    expect(getCharLimit('linkedin')).toBe(3000);
    expect(getCharLimit('facebook')).toBe(63206);
    expect(getCharLimit('instagram')).toBe(2200);
    expect(getCharLimit('bluesky')).toBe(300);
  });

  it('returns default 280 for unknown platform', () => {
    expect(getCharLimit('unknown')).toBe(280);
  });
});

describe('isOverLimit', () => {
  it('returns false when under limit', () => {
    expect(isOverLimit('Hello world', 'twitter')).toBe(false);
  });

  it('returns true when over limit', () => {
    const longText = 'a'.repeat(281);
    expect(isOverLimit(longText, 'twitter')).toBe(true);
  });

  it('returns false at exactly the limit', () => {
    const exactText = 'a'.repeat(280);
    expect(isOverLimit(exactText, 'twitter')).toBe(false);
  });
});

describe('getCharCount', () => {
  it('counts characters correctly', () => {
    expect(getCharCount('Hello')).toBe(5);
    expect(getCharCount('')).toBe(0);
    expect(getCharCount('Hello World!')).toBe(12);
  });
});

describe('getRemainingChars', () => {
  it('returns remaining characters', () => {
    expect(getRemainingChars('Hello', 'twitter')).toBe(275);
  });

  it('returns negative when over limit', () => {
    const longText = 'a'.repeat(300);
    expect(getRemainingChars(longText, 'twitter')).toBe(-20);
  });
});

describe('validatePostContent', () => {
  it('validates content for multiple platforms', () => {
    const result = validatePostContent('Hello world', ['twitter', 'linkedin']);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns error when content exceeds platform limit', () => {
    const longContent = 'a'.repeat(300);
    const result = validatePostContent(longContent, ['twitter', 'bluesky']);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Twitter');
  });

  it('returns error for empty content', () => {
    const result = validatePostContent('', ['twitter']);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('empty');
  });

  it('passes when content fits all platforms', () => {
    const content = 'a'.repeat(200);
    const result = validatePostContent(content, ['twitter', 'linkedin', 'bluesky']);
    expect(result.valid).toBe(true);
  });
});

describe('stripHtml', () => {
  it('strips HTML tags', () => {
    expect(stripHtml('<p>Hello <strong>world</strong></p>')).toBe('Hello world');
  });

  it('handles empty string', () => {
    expect(stripHtml('')).toBe('');
  });

  it('handles nested tags', () => {
    expect(stripHtml('<div><p><em>test</em></p></div>')).toBe('test');
  });
});

describe('adaptContentForPlatform', () => {
  it('truncates content for twitter if too long', () => {
    const longContent = 'a'.repeat(300);
    const result = adaptContentForPlatform(longContent, 'twitter');
    expect(result.length).toBeLessThanOrEqual(280);
    expect(result).toContain('...');
  });

  it('does not modify content within limits', () => {
    const content = 'Hello world';
    const result = adaptContentForPlatform(content, 'twitter');
    expect(result).toBe(content);
  });

  it('preserves content for platforms with high limits', () => {
    const content = 'a'.repeat(1000);
    const result = adaptContentForPlatform(content, 'linkedin');
    expect(result).toBe(content);
  });
});
