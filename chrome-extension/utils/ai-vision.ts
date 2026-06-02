export type AnalysisMode = 'describe' | 'code' | 'ui-review';

export interface AnalysisResult {
  mode: AnalysisMode;
  content: string;
}

const MODE_PROMPTS: Record<AnalysisMode, string> = {
  describe: `Analyze this screenshot and provide a detailed description. Return JSON:
{
  "content": "Detailed description of what's shown: layout, content, visual elements, color scheme, typography, and overall purpose of the interface."
}`,

  code: `Analyze this screenshot and generate HTML/CSS code that replicates the UI. Return JSON:
{
  "content": "Complete HTML and CSS code that reproduces the layout and styling shown in the screenshot. Use semantic HTML, modern CSS (flexbox/grid), and include inline styles or a <style> block. Make it self-contained and responsive."
}`,

  'ui-review': `Analyze this UI screenshot as a UX/design expert. Return JSON:
{
  "content": "Detailed UI/UX review covering: 1) Visual hierarchy and layout, 2) Color scheme and contrast, 3) Typography and readability, 4) Spacing and alignment, 5) Accessibility concerns, 6) Specific improvement suggestions with rationale."
}`,
};

export async function analyzeScreenshot(
  imageDataUrl: string,
  mode: AnalysisMode,
  settings: { provider: 'openai' | 'claude'; apiKey: string; model: string }
): Promise<AnalysisResult> {
  const prompt = MODE_PROMPTS[mode];

  if (settings.provider === 'openai') {
    return callOpenAIVision(imageDataUrl, prompt, settings);
  }
  return callClaudeVision(imageDataUrl, prompt, settings);
}

async function callOpenAIVision(
  imageDataUrl: string,
  prompt: string,
  settings: { apiKey: string; model: string }
): Promise<AnalysisResult> {
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
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageDataUrl, detail: 'high' } },
          ],
        }],
        max_tokens: 4096,
        temperature: 0.3,
      }),
    });
  } catch {
    throw visionError('network', 'Network error — check your connection');
  }

  if (!res.ok) {
    throw await parseVisionError(res);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw visionError('unknown', 'Empty response from API');

  return parseVisionResponse(content);
}

async function callClaudeVision(
  imageDataUrl: string,
  prompt: string,
  settings: { apiKey: string; model: string }
): Promise<AnalysisResult> {
  const base64Match = imageDataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!base64Match) throw visionError('unknown', 'Invalid image data');

  const mediaType = base64Match[1] === 'jpg' ? 'image/jpeg' : `image/${base64Match[1]}`;
  const base64Data = base64Match[2];

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
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64Data },
            },
            { type: 'text', text: prompt },
          ],
        }],
      }),
    });
  } catch {
    throw visionError('network', 'Network error — check your connection');
  }

  if (!res.ok) {
    throw await parseVisionError(res);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text;
  if (!text) throw visionError('unknown', 'Empty response from API');

  return parseVisionResponse(text);
}

function parseVisionResponse(text: string): AnalysisResult {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
  const jsonStr = jsonMatch[1]!.trim();

  try {
    const parsed = JSON.parse(jsonStr);
    return { mode: 'describe', content: parsed.content || text.trim() };
  } catch {
    return { mode: 'describe', content: text.trim() };
  }
}

async function parseVisionError(res: Response): Promise<Error & { code: string }> {
  try {
    const body = await res.json();
    const msg = body.error?.message || body.message || `HTTP ${res.status}`;
    if (res.status === 401) return visionError('invalid_key', 'Invalid API key — check your settings');
    if (res.status === 429) return visionError('rate_limit', 'Rate limit exceeded — try again later');
    if (res.status === 402 || body.error?.code === 'insufficient_quota') {
      return visionError('quota', 'API quota exceeded — check your billing');
    }
    return visionError('unknown', msg);
  } catch {
    return visionError('unknown', `HTTP ${res.status}`);
  }
}

function visionError(code: string, message: string): Error & { code: string } {
  const e = new Error(message) as Error & { code: string };
  e.code = code;
  return e;
}
