// PageAudit: AI-powered landing page analysis engine

export interface DimensionScore {
  name: string
  score: number      // 1-10
  weight: number     // 0-1
  suggestions: string[]
}

export interface AuditResult {
  url: string
  overallScore: number  // 0-100
  dimensions: DimensionScore[]
  summary: string
  topActions: string[]
  timestamp: number
}

const ANALYSIS_PROMPT = `You are a landing page CRO (Conversion Rate Optimization) expert.
Analyze the given webpage screenshot and provide a detailed assessment.

Evaluate the following 5 dimensions (score each 1-10):

1. **Visual Design** (weight: 0.25)
   - Layout quality, whitespace usage, visual hierarchy
   - Color scheme harmony and brand consistency
   - Typography readability and font choices

2. **Copy Quality** (weight: 0.25)
   - Headline clarity and impact
   - Value proposition communication
   - Subheading effectiveness and supporting copy

3. **CTA Effectiveness** (weight: 0.20)
   - CTA button visibility and placement
   - CTA copy persuasiveness
   - Color contrast and urgency signals

4. **Mobile Adaptability** (weight: 0.15)
   - Responsive design quality
   - Touch-friendly elements
   - Readability on small screens

5. **Performance** (weight: 0.15)
   - Perceived loading speed
   - Visual weight (heavy images/animations)
   - Content above-the-fold optimization

Output format (JSON):
{
  "dimensions": [
    {
      "name": "Visual Design",
      "score": 7,
      "suggestions": [
        "Increase whitespace between sections for better readability",
        "Use a more consistent color palette across all elements",
        "Improve visual hierarchy with larger headings"
      ]
    },
    ...5 dimensions
  ],
  "summary": "2-3 sentence overall assessment",
  "topActions": [
    "Most impactful improvement #1",
    "Most impactful improvement #2",
    "Most impactful improvement #3"
  ]
}

Respond ONLY with valid JSON, no markdown fences.`

export async function analyzePageWithAI(
  desktopBase64: string,
  mobileBase64: string,
  url: string
): Promise<AuditResult> {
  const apiKey = process.env.MIMO_API_KEY
  const baseUrl = process.env.MIMO_BASE_URL || 'https://api.xiaomimimo.com/v1'
  const model = process.env.MIMO_MODEL || 'mimo-v2-flash'

  if (!apiKey || apiKey === 'your-mimo-api-key-here') {
    return createFallbackResult(url)
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: ANALYSIS_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: `Analyze this landing page: ${url}\n\nDesktop screenshot:` },
              { type: 'image_url', image_url: { url: `data:image/png;base64,${desktopBase64}` } },
              { type: 'text', text: '\n\nMobile screenshot:' },
              { type: 'image_url', image_url: { url: `data:image/png;base64,${mobileBase64}` } },
            ],
          },
        ],
        temperature: 0.3,
        max_tokens: 2048,
        thinking: { type: 'disabled' },
      }),
    })

    if (!response.ok) {
      console.error('[PageAudit] AI API error:', response.status)
      return createFallbackResult(url)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    // Parse AI response JSON
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return buildAuditResult(url, parsed)
  } catch (err) {
    console.error('[PageAudit] AI analysis error:', err)
    return createFallbackResult(url)
  }
}

const DIMENSION_WEIGHTS: Record<string, number> = {
  'Visual Design': 0.25,
  'Copy Quality': 0.25,
  'CTA Effectiveness': 0.20,
  'Mobile Adaptability': 0.15,
  'Performance': 0.15,
}

function buildAuditResult(url: string, parsed: any): AuditResult {
  const dimensions: DimensionScore[] = (parsed.dimensions || []).map((d: any) => ({
    name: d.name || 'Unknown',
    score: Math.min(10, Math.max(1, Number(d.score) || 5)),
    weight: DIMENSION_WEIGHTS[d.name] || 0.2,
    suggestions: Array.isArray(d.suggestions) ? d.suggestions : [],
  }))

  const overallScore = dimensions.length > 0
    ? Math.round(dimensions.reduce((sum, d) => sum + d.score * d.weight * 10, 0) / dimensions.reduce((sum, d) => sum + d.weight, 0))
    : 50

  return {
    url,
    overallScore,
    dimensions,
    summary: parsed.summary || 'Analysis complete.',
    topActions: Array.isArray(parsed.topActions) ? parsed.topActions : [],
    timestamp: Date.now(),
  }
}

function createFallbackResult(url: string): AuditResult {
  const dims: DimensionScore[] = [
    { name: 'Visual Design', score: 5, weight: 0.25, suggestions: ['AI service unavailable - unable to analyze visual design', 'Ensure consistent spacing and typography', 'Check color contrast ratios'] },
    { name: 'Copy Quality', score: 5, weight: 0.25, suggestions: ['AI service unavailable - unable to analyze copy', 'Keep headlines clear and benefit-focused', 'Use active voice in CTAs'] },
    { name: 'CTA Effectiveness', score: 5, weight: 0.20, suggestions: ['AI service unavailable - unable to analyze CTAs', 'Make CTA buttons large and contrasting', 'Place primary CTA above the fold'] },
    { name: 'Mobile Adaptability', score: 5, weight: 0.15, suggestions: ['AI service unavailable - unable to analyze mobile', 'Test all elements on 375px width', 'Ensure touch targets are at least 44px'] },
    { name: 'Performance', score: 5, weight: 0.15, suggestions: ['AI service unavailable - unable to analyze performance', 'Optimize images (WebP format)', 'Minimize render-blocking resources'] },
  ]

  return {
    url,
    overallScore: 50,
    dimensions: dims,
    summary: 'AI analysis service is currently unavailable. Showing general best-practice suggestions.',
    topActions: ['Add a clear, benefit-focused headline above the fold', 'Ensure CTA button has high color contrast', 'Optimize page load time under 3 seconds'],
    timestamp: Date.now(),
  }
}
