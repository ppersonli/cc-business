export type AiProvider = 'openai' | 'claude';

export interface AiSettings {
  provider: AiProvider;
  apiKey: string;
  model: string;
}

export interface SummaryOptions {
  url: string;
  title: string;
  text: string;
  language?: string;
}

export interface YoutubeSummaryOptions {
  url: string;
  title: string;
  captions: string;
  videoId: string;
  language?: string;
}

export interface SummaryResponse {
  summary: string;
  keyPoints: string[];
  timestamps?: { time: string; label: string }[];
}

export interface AiError {
  code: 'invalid_key' | 'rate_limit' | 'network' | 'quota' | 'unknown';
  message: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const DEFAULT_MODELS: Record<AiProvider, string> = {
  openai: 'gpt-4o-mini',
  claude: 'claude-haiku-4-5-20251001',
};

export const AVAILABLE_MODELS: Record<AiProvider, { id: string; name: string }[]> = {
  openai: [
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
    { id: 'gpt-4o', name: 'GPT-4o' },
  ],
  claude: [
    { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5' },
    { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6' },
  ],
};

export async function loadSettings(): Promise<AiSettings | null> {
  const data = await browser.storage.sync.get(['aiProvider', 'aiApiKey', 'aiModel']);
  if (!data.aiApiKey) return null;
  return {
    provider: data.aiProvider || 'openai',
    apiKey: data.aiApiKey,
    model: data.aiModel || DEFAULT_MODELS[data.aiProvider || 'openai'],
  };
}

export async function validateApiKey(provider: AiProvider, apiKey: string, model?: string): Promise<{ valid: boolean; error?: string }> {
  try {
    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (res.status === 401) return { valid: false, error: 'Invalid API key' };
      if (res.status === 429) return { valid: false, error: 'Rate limited — key is valid but throttled' };
      return { valid: res.ok };
    } else {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: model || 'claude-haiku-4-5-20251001',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'hi' }],
        }),
      });
      if (res.status === 401) return { valid: false, error: 'Invalid API key' };
      if (res.status === 429) return { valid: false, error: 'Rate limited — key is valid but throttled' };
      return { valid: res.ok };
    }
  } catch {
    return { valid: false, error: 'Network error — check your connection' };
  }
}

export async function summarizePage(options: SummaryOptions, settings: AiSettings, promptOverride?: string): Promise<SummaryResponse> {
  const prompt = promptOverride
    ? `${promptOverride}\n\nPage title: ${options.title}\nURL: ${options.url}\n\nContent:\n${options.text.slice(0, 8000)}`
    : buildPagePrompt(options);
  return callAi(prompt, settings);
}

export async function summarizeYoutube(options: YoutubeSummaryOptions, settings: AiSettings): Promise<SummaryResponse> {
  const prompt = buildYoutubePrompt(options);
  return callAi(prompt, settings);
}

export async function summarizeSelection(text: string, pageTitle: string, settings: AiSettings): Promise<SummaryResponse> {
  const prompt = `Summarize the following selected text from the page "${pageTitle}". Respond in JSON format:
{
  "summary": "A clear 2-3 sentence summary",
  "keyPoints": ["point 1", "point 2", "point 3"]
}

Selected text:
${text}`;
  return callAi(prompt, settings);
}

export async function chatWithPageContent(
  pageContent: string,
  chatHistory: ChatMessage[],
  userMessage: string,
  settings: AiSettings,
  pageTitle?: string,
): Promise<string> {
  const systemPrompt = `You are a helpful assistant that answers questions about web page content. The user is viewing a webpage and wants to ask follow-up questions about it. Answer based on the page content provided. Be concise and helpful. If the answer isn't in the page content, say so clearly.`;

  const contextMessage = `Here is the web page content the user is asking about:\n\nPage title: ${pageTitle || 'Unknown'}\n\n${pageContent.slice(0, 8000)}`;

  if (settings.provider === 'openai') {
    return chatOpenAI(systemPrompt, contextMessage, chatHistory, userMessage, settings);
  }
  return chatClaude(systemPrompt, contextMessage, chatHistory, userMessage, settings);
}

async function chatOpenAI(
  systemPrompt: string,
  contextMessage: string,
  chatHistory: ChatMessage[],
  userMessage: string,
  settings: AiSettings,
): Promise<string> {
  const messages = [
    { role: 'system' as const, content: systemPrompt },
    { role: 'user' as const, content: contextMessage },
    ...chatHistory.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user' as const, content: userMessage },
  ];

  let res: Response;
  try {
    res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        messages,
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });
  } catch {
    throw toAiError({ code: 'network', message: 'Network error — check your connection' });
  }

  if (!res.ok) throw toAiError(await parseApiError(res));

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw toAiError({ code: 'unknown', message: 'Empty response from API' });
  return content.trim();
}

async function chatClaude(
  systemPrompt: string,
  contextMessage: string,
  chatHistory: ChatMessage[],
  userMessage: string,
  settings: AiSettings,
): Promise<string> {
  const messages = [
    { role: 'user' as const, content: contextMessage },
    ...chatHistory.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user' as const, content: userMessage },
  ];

  let res: Response;
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': settings.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: settings.model,
        system: systemPrompt,
        max_tokens: 1024,
        messages,
      }),
    });
  } catch {
    throw toAiError({ code: 'network', message: 'Network error — check your connection' });
  }

  if (!res.ok) throw toAiError(await parseApiError(res));

  const data = await res.json();
  const text = data.content?.[0]?.text;
  if (!text) throw toAiError({ code: 'unknown', message: 'Empty response from API' });
  return text.trim();
}

export function buildPagePrompt(options: SummaryOptions): string {
  const langHint = options.language && options.language !== 'en'
    ? ` Respond in ${languageName(options.language)}.`
    : '';

  return `Summarize the following web page. Respond in JSON format:
{
  "summary": "A clear, concise summary of the page content (3-5 sentences)",
  "keyPoints": ["key point 1", "key point 2", "key point 3", "key point 4", "key point 5"]
}${langHint}

Page title: ${options.title}
URL: ${options.url}

Content:
${options.text.slice(0, 8000)}`;
}

export function buildYoutubePrompt(options: YoutubeSummaryOptions): string {
  const langHint = options.language && options.language !== 'en'
    ? ` Respond in ${languageName(options.language)}.`
    : '';

  return `Summarize the following YouTube video based on its captions. Respond in JSON format:
{
  "summary": "A clear, concise summary of the video (3-5 sentences)",
  "keyPoints": ["key point 1", "key point 2", "key point 3"],
  "timestamps": [
    {"time": "0:00", "label": "Introduction"},
    {"time": "M:SS", "label": "Topic description"}
  ]
}
Include 3-6 timestamps marking the main topics discussed.${langHint}

Video title: ${options.title}
URL: ${options.url}

Captions:
${options.captions.slice(0, 8000)}`;
}

export function languageName(code: string): string {
  const names: Record<string, string> = { zh: 'Chinese', ja: 'Japanese', ko: 'Korean' };
  return names[code] || code;
}

async function callAi(prompt: string, settings: AiSettings): Promise<SummaryResponse> {
  if (settings.provider === 'openai') {
    return callOpenAI(prompt, settings);
  }
  return callClaude(prompt, settings);
}

async function callOpenAI(prompt: string, settings: AiSettings): Promise<SummaryResponse> {
  let res: Response;
  try {
    res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1024,
        response_format: { type: 'json_object' },
      }),
    });
  } catch {
    throw toAiError({ code: 'network', message: 'Network error — check your connection' });
  }

  if (!res.ok) {
    throw toAiError(await parseApiError(res));
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw toAiError({ code: 'unknown', message: 'Empty response from API' });

  return parseJsonResponse(content);
}

async function callClaude(prompt: string, settings: AiSettings): Promise<SummaryResponse> {
  let res: Response;
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': settings.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: settings.model,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
  } catch {
    throw toAiError({ code: 'network', message: 'Network error — check your connection' });
  }

  if (!res.ok) {
    throw toAiError(await parseApiError(res));
  }

  const data = await res.json();
  const text = data.content?.[0]?.text;
  if (!text) throw toAiError({ code: 'unknown', message: 'Empty response from API' });

  return parseJsonResponse(text);
}

async function parseApiError(res: Response): Promise<AiError> {
  try {
    const body = await res.json();
    const msg = body.error?.message || body.message || `HTTP ${res.status}`;

    if (res.status === 401) return { code: 'invalid_key', message: 'Invalid API key — check your settings' };
    if (res.status === 429) return { code: 'rate_limit', message: 'Rate limit exceeded — try again later' };
    if (res.status === 402 || body.error?.code === 'insufficient_quota') {
      return { code: 'quota', message: 'API quota exceeded — check your billing' };
    }
    return { code: 'unknown', message: msg };
  } catch {
    return { code: 'unknown', message: `HTTP ${res.status}` };
  }
}

export function parseJsonResponse(text: string): SummaryResponse {
  // Extract JSON from possible markdown code fences
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
  const jsonStr = jsonMatch[1]!.trim();

  try {
    const parsed = JSON.parse(jsonStr);
    return {
      summary: parsed.summary || 'No summary generated',
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
      timestamps: Array.isArray(parsed.timestamps) ? parsed.timestamps : undefined,
    };
  } catch {
    // Fallback: treat entire response as summary
    return { summary: text.trim(), keyPoints: [] };
  }
}

const HOSTED_API_BASE = 'https://tools.pixiaoli.cn/api';

export async function summarizeViaHosted(text: string, url: string): Promise<SummaryResponse> {
  const userIdData = await browser.storage.local.get('userId');
  const userId = userIdData.userId as string || 'anonymous';

  let res: Response;
  try {
    res = await fetch(`${HOSTED_API_BASE}/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.slice(0, 8000), url, userId }),
    });
  } catch {
    throw toAiError({ code: 'network', message: 'Network error — check your connection' });
  }

  if (!res.ok) {
    if (res.status === 429) throw toAiError({ code: 'rate_limit', message: 'Daily limit reached (3/day). Upgrade to Pro for unlimited.' });
    throw toAiError({ code: 'unknown', message: `Hosted API error (${res.status})` });
  }

  const data = await res.json();
  return {
    summary: data.summary || 'No summary generated',
    keyPoints: Array.isArray(data.keyPoints) ? data.keyPoints : [],
    timestamps: Array.isArray(data.timestamps) ? data.timestamps : undefined,
  };
}

export function toAiError(err: AiError): Error & AiError {
  const e = new Error(err.message) as Error & AiError;
  e.code = err.code;
  return e;
}
