/**
 * OpenAI API client for TabMaster AI.
 * Uses fetch directly (no SDK) — Chrome extension compatible.
 * Model: GPT-4o-mini for cost-effective classification and search.
 */

import type { TabInfo, TabCategory } from './tab-utils';
import {
  buildClassificationPrompt,
  buildSearchPrompt,
  parseClassificationResponse,
  parseSearchResponse,
} from './ai-prompts';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';
const STORAGE_KEY = 'openai_api_key';

export interface ClassificationResult {
  id: number;
  category: TabCategory;
  confidence: number;
}

export interface SearchResult {
  id: number;
  relevance: number;
  reason: string;
}

export interface OpenAIError {
  message: string;
  status?: number;
}

/**
 * Get the stored OpenAI API key.
 */
export async function getApiKey(): Promise<string | null> {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    const data = await chrome.storage.local.get([STORAGE_KEY]);
    return data[STORAGE_KEY] || null;
  }
  // Dev/test fallback
  const val = localStorage.getItem(`tabmaster_local_${STORAGE_KEY}`);
  return val ? JSON.parse(val) : null;
}

/**
 * Store the OpenAI API key.
 */
export async function setApiKey(key: string): Promise<void> {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    await chrome.storage.local.set({ [STORAGE_KEY]: key });
  } else {
    localStorage.setItem(`tabmaster_local_${STORAGE_KEY}`, JSON.stringify(key));
  }
}

/**
 * Call OpenAI chat completions API.
 */
export async function callOpenAI(
  apiKey: string,
  userPrompt: string,
): Promise<string> {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a browser tab classification and search assistant. Always respond with valid JSON arrays only, no markdown fences.' },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error');
    throw { message: `OpenAI API error: ${response.status} - ${errorBody}`, status: response.status } as OpenAIError;
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw { message: 'Empty response from OpenAI API' } as OpenAIError;
  }

  return content;
}

/**
 * Classify tabs using AI.
 * Returns classification results or null if API key is missing.
 */
export async function classifyTabs(
  tabs: TabInfo[],
): Promise<ClassificationResult[] | null> {
  const apiKey = await getApiKey();
  if (!apiKey) return null;

  const prompt = buildClassificationPrompt(tabs);
  const response = await callOpenAI(apiKey, prompt);
  const tabIds = tabs.map(t => t.id);
  return parseClassificationResponse(response, tabIds);
}

/**
 * Search tabs using AI natural language query.
 * Returns search results sorted by relevance, or null if API key is missing.
 */
export async function searchTabsAI(
  query: string,
  tabs: TabInfo[],
): Promise<SearchResult[] | null> {
  const apiKey = await getApiKey();
  if (!apiKey) return null;

  const prompt = buildSearchPrompt(query, tabs);
  const response = await callOpenAI(apiKey, prompt);
  return parseSearchResponse(response);
}
