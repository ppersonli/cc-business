/**
 * AI prompt builders for SocialForge.
 * Constructs prompts for Gemini API content generation, rewriting, and translation.
 */

import { getCharLimit } from '@/lib/content/platform';

interface GenerateOptions {
  topic: string;
  platform: string;
  tone?: string;
  includeHashtags?: boolean;
  includeEmojis?: boolean;
}

interface RewriteOptions {
  content: string;
  style?: string;
  platform?: string;
}

interface TranslateOptions {
  content: string;
  targetLanguage: string;
}

export function buildGeneratePrompt(options: GenerateOptions): string {
  const { topic, platform, tone = 'casual', includeHashtags = true, includeEmojis = true } = options;
  const charLimit = getCharLimit(platform);

  let prompt = `Write a ${tone} social media post for ${platform} about "${topic}".`;
  prompt += `\nThe post must be under ${charLimit} characters.`;
  if (includeHashtags) prompt += '\nInclude relevant hashtags.';
  if (includeEmojis) prompt += '\nUse appropriate emojis to make it engaging.';
  prompt += '\nReturn only the post content, no explanations.';

  return prompt;
}

export function buildRewritePrompt(options: RewriteOptions): string {
  const { content, style = 'more engaging', platform } = options;

  let prompt = `Rewrite the following social media post to be ${style}:`;
  prompt += `\n\n"${content}"`;
  if (platform) {
    const charLimit = getCharLimit(platform);
    prompt += `\nKeep it under ${charLimit} characters for ${platform}.`;
  }
  prompt += '\nReturn only the rewritten content, no explanations.';

  return prompt;
}

export function buildTranslatePrompt(options: TranslateOptions): string {
  const { content, targetLanguage } = options;

  let prompt = `Translate the following social media post to ${targetLanguage}:`;
  prompt += `\n\n"${content}"`;
  prompt += '\nMaintain the tone and style. Return only the translated content, no explanations.';

  return prompt;
}

/**
 * Rough token estimation (1 token ≈ 4 characters for English).
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Parse an AI response, stripping any wrapper text.
 */
export function parseAIResponse(response: string): string {
  // Remove markdown code blocks if present
  let cleaned = response.trim();
  if (cleaned.startsWith('```') && cleaned.endsWith('```')) {
    cleaned = cleaned.slice(3, -3).trim();
    // Remove language identifier if present
    const firstNewline = cleaned.indexOf('\n');
    if (firstNewline > 0 && firstNewline < 20) {
      cleaned = cleaned.slice(firstNewline + 1).trim();
    }
  }
  // Remove surrounding quotes
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}
