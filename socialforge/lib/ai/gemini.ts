/**
 * Gemini AI integration for SocialForge.
 * Handles content generation, rewriting, and translation.
 */

import { buildGeneratePrompt, buildRewritePrompt, buildTranslatePrompt, estimateTokens, parseAIResponse } from './prompts';
import { getDb } from '@/lib/db';
import { aiGenerations } from '@/lib/db/schema';
import { nowISO } from '@/lib/utils/format';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

interface GenerateResult {
  content: string;
  tokensUsed: number;
  model: string;
}

async function callGemini(prompt: string): Promise<{ text: string; tokensUsed: number }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Return mock response for development
    return { text: `[AI Generated] ${prompt.slice(0, 100)}...`, tokensUsed: estimateTokens(prompt) + 50 };
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 500 },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const tokensUsed = (data.usageMetadata?.totalTokenCount || estimateTokens(prompt + text));

  return { text, tokensUsed };
}

async function logGeneration(userId: string, prompt: string, result: string, model: string, tokensUsed: number) {
  const db = getDb();
  await db.insert(aiGenerations).values({
    id: crypto.randomUUID(),
    userId,
    prompt,
    result,
    model,
    tokensUsed,
    createdAt: nowISO(),
  });
}

export async function generateContent(
  userId: string,
  options: { topic: string; platform: string; tone?: string; includeHashtags?: boolean; includeEmojis?: boolean }
): Promise<GenerateResult> {
  const prompt = buildGeneratePrompt(options);
  const { text, tokensUsed } = await callGemini(prompt);
  const content = parseAIResponse(text);

  await logGeneration(userId, prompt, content, 'gemini-pro', tokensUsed);

  return { content, tokensUsed, model: 'gemini-pro' };
}

export async function rewriteContent(
  userId: string,
  options: { content: string; style?: string; platform?: string }
): Promise<GenerateResult> {
  const prompt = buildRewritePrompt(options);
  const { text, tokensUsed } = await callGemini(prompt);
  const content = parseAIResponse(text);

  await logGeneration(userId, prompt, content, 'gemini-pro', tokensUsed);

  return { content, tokensUsed, model: 'gemini-pro' };
}

export async function translateContent(
  userId: string,
  options: { content: string; targetLanguage: string }
): Promise<GenerateResult> {
  const prompt = buildTranslatePrompt(options);
  const { text, tokensUsed } = await callGemini(prompt);
  const content = parseAIResponse(text);

  await logGeneration(userId, prompt, content, 'gemini-pro', tokensUsed);

  return { content, tokensUsed, model: 'gemini-pro' };
}
