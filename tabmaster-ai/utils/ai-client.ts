import { buildClassificationPrompt, buildSearchPrompt, parseClassificationResponse, parseSearchResponse, type TabInfo, type ClassificationResult, type SearchResult } from '~/utils/ai-prompts';

export interface AISettings {
  apiKey: string;
  model: string;
  provider: 'openai';
}

const SETTINGS_KEY = 'tabmaster-ai-settings';
const API_BASE = 'https://api.openai.com/v1/chat/completions';

export async function loadAISettings(): Promise<AISettings | null> {
  const data = await browser.storage.local.get(SETTINGS_KEY);
  const settings = data[SETTINGS_KEY] as AISettings | undefined;
  if (!settings?.apiKey) return null;
  return settings;
}

export async function saveAISettings(settings: AISettings): Promise<void> {
  await browser.storage.local.set({ [SETTINGS_KEY]: settings });
}

export async function clearAISettings(): Promise<void> {
  await browser.storage.local.remove(SETTINGS_KEY);
}

interface ApiError {
  code: string;
  message: string;
}

function parseApiError(status: number, body: any): ApiError {
  if (status === 401) return { code: 'invalid_key', message: 'Invalid API key' };
  if (status === 429) return { code: 'rate_limit', message: 'Rate limit exceeded' };
  if (status === 402) return { code: 'quota', message: 'API quota exceeded' };
  const msg = body?.error?.message || `API error (${status})`;
  return { code: 'api_error', message: msg };
}

async function callOpenAI(prompt: string, settings: AISettings): Promise<string> {
  let res: Response;
  try {
    res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a browser tab management assistant. Return only valid JSON arrays as requested.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 2048,
      }),
    });
  } catch {
    const err: ApiError & { code: string } = { code: 'network', message: 'Network error' } as any;
    throw Object.assign(new Error(err.message), { code: err.code });
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = parseApiError(res.status, body);
    throw Object.assign(new Error(err.message), { code: err.code });
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

export async function classifyTabsAI(tabs: TabInfo[], settings?: AISettings | null): Promise<ClassificationResult[]> {
  const resolved = settings ?? await loadAISettings();
  if (!resolved) throw Object.assign(new Error('No API key configured'), { code: 'no_key' });

  const prompt = buildClassificationPrompt(tabs);
  const response = await callOpenAI(prompt, resolved);
  return parseClassificationResponse(response);
}

export async function searchTabsAI(query: string, tabs: TabInfo[], settings?: AISettings | null): Promise<SearchResult[]> {
  const resolved = settings ?? await loadAISettings();
  if (!resolved) throw Object.assign(new Error('No API key configured'), { code: 'no_key' });

  const prompt = buildSearchPrompt(query, tabs);
  const response = await callOpenAI(prompt, resolved);
  return parseSearchResponse(response);
}
