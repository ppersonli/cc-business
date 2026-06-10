import { describe, it, expect } from 'vitest';
import { buildGeneratePrompt, buildRewritePrompt, buildTranslatePrompt, estimateTokens, parseAIResponse } from '../prompts';

describe('buildGeneratePrompt', () => {
  it('builds a prompt for content generation', () => {
    const prompt = buildGeneratePrompt({ topic: 'AI trends', platform: 'twitter', tone: 'professional' });
    expect(prompt).toContain('AI trends');
    expect(prompt).toContain('twitter');
    expect(prompt).toContain('280');
    expect(prompt).toContain('professional');
  });

  it('includes character limit for the platform', () => {
    const prompt = buildGeneratePrompt({ topic: 'test', platform: 'linkedin' });
    expect(prompt).toContain('3000');
  });

  it('defaults to casual tone', () => {
    const prompt = buildGeneratePrompt({ topic: 'test', platform: 'twitter' });
    expect(prompt).toContain('casual');
  });
});

describe('buildRewritePrompt', () => {
  it('builds a rewrite prompt', () => {
    const prompt = buildRewritePrompt({ content: 'Hello world', style: 'more engaging' });
    expect(prompt).toContain('Hello world');
    expect(prompt).toContain('more engaging');
  });

  it('includes the original content', () => {
    const original = 'This is my original post about social media.';
    const prompt = buildRewritePrompt({ content: original });
    expect(prompt).toContain(original);
  });
});

describe('buildTranslatePrompt', () => {
  it('builds a translation prompt', () => {
    const prompt = buildTranslatePrompt({ content: 'Hello', targetLanguage: 'Japanese' });
    expect(prompt).toContain('Hello');
    expect(prompt).toContain('Japanese');
  });

  it('includes the target language', () => {
    const prompt = buildTranslatePrompt({ content: 'test', targetLanguage: 'Portuguese' });
    expect(prompt).toContain('Portuguese');
  });
});

describe('estimateTokens', () => {
  it('estimates tokens for English text', () => {
    const tokens = estimateTokens('Hello world, this is a test.');
    expect(tokens).toBeGreaterThan(0);
    expect(tokens).toBeLessThan(20);
  });

  it('returns 0 for empty string', () => {
    expect(estimateTokens('')).toBe(0);
  });

  it('scales with text length', () => {
    const short = estimateTokens('Hi');
    const long = estimateTokens('This is a much longer piece of text that should have more tokens.');
    expect(long).toBeGreaterThan(short);
  });
});

describe('parseAIResponse', () => {
  it('extracts content from a response', () => {
    const result = parseAIResponse('Here is your post:\n\nHello world!');
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('handles plain text response', () => {
    const result = parseAIResponse('Just a simple tweet.');
    expect(result).toBe('Just a simple tweet.');
  });
});
