// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License
// WeChat Dark Mode Algorithm — HSL-based color inversion

// ── Element Classification ──
type ElementCategory =
  | 'heading'
  | 'body'
  | 'background'
  | 'table'
  | 'code'
  | 'blockquote'
  | 'link'
  | 'decorative-dark'
  | 'vibrant-protected'

const SELECTOR_PATTERNS: Array<{ pattern: RegExp; category: ElementCategory }> = [
  { pattern: /h[1-6]|\.heading/, category: 'heading' },
  { pattern: /blockquote/, category: 'blockquote' },
  { pattern: /table|th|td|tr/, category: 'table' },
  { pattern: /pre|code|\.hljs/, category: 'code' },
  { pattern: /\ba\b/, category: 'link' },
  { pattern: /\.wemd-preview$|\.wemd-preview\s*{/, category: 'background' },
]

function classifySelector(selector: string): ElementCategory {
  for (const { pattern, category } of SELECTOR_PATTERNS) {
    if (pattern.test(selector)) return category
  }
  return 'body'
}

// ── Color Parsing ──

interface HSL {
  h: number
  s: number
  l: number
}

function hexToRgb(hex: string): [number, number, number] | null {
  const cleaned = hex.replace('#', '')
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16)
    const g = parseInt(cleaned[1] + cleaned[1], 16)
    const b = parseInt(cleaned[2] + cleaned[2], 16)
    return [r, g, b]
  }
  if (cleaned.length === 6) {
    const r = parseInt(cleaned.slice(0, 2), 16)
    const g = parseInt(cleaned.slice(2, 4), 16)
    const b = parseInt(cleaned.slice(4, 6), 16)
    return [r, g, b]
  }
  return null
}

function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * Math.max(0, Math.min(1, color)))
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function parseColor(value: string): HSL | null {
  const trimmed = value.trim()

  // hex
  const hexMatch = trimmed.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
  if (hexMatch) {
    const rgb = hexToRgb(hexMatch[0])
    if (rgb) return rgbToHsl(...rgb)
  }

  // rgb(r, g, b)
  const rgbMatch = trimmed.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/)
  if (rgbMatch) {
    return rgbToHsl(parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3]))
  }

  // rgba(r, g, b, a) — ignore alpha for conversion
  const rgbaMatch = trimmed.match(/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)$/)
  if (rgbaMatch) {
    return rgbToHsl(parseInt(rgbaMatch[1]), parseInt(rgbaMatch[2]), parseInt(rgbaMatch[3]))
  }

  return null
}

function hslToRgbString(h: number, s: number, l: number): string {
  const hex = hslToHex(h, s, l)
  const rgb = hexToRgb(hex)
  if (!rgb) return `rgb(0, 0, 0)`
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
}

// ── Lightness Inversion by Category ──

function invertLightness(hsl: HSL, category: ElementCategory): HSL {
  const { h, s, l } = hsl
  let newL: number
  let newS = s

  switch (category) {
    case 'background':
      // Light backgrounds → dark, dark backgrounds → keep dark
      newL = l > 50 ? Math.max(5, 100 - l) : Math.min(95, l + 10)
      newS = Math.max(s * 0.3, 5) // desaturate backgrounds
      break

    case 'heading':
      // Dark headings → bright, light headings → slightly darker
      newL = l < 50 ? Math.min(95, 100 - l + 10) : Math.max(10, l - 15)
      break

    case 'body':
      // Standard inversion with contrast preservation
      newL = l < 50 ? Math.min(92, 100 - l) : Math.max(8, 100 - l)
      break

    case 'table':
      // Table cells: invert but preserve relative contrast
      newL = l > 50 ? Math.max(10, 100 - l - 5) : Math.min(90, 100 - l + 5)
      break

    case 'code':
      // Code blocks: preserve syntax colors, invert backgrounds
      newL = l > 70 ? Math.max(10, 100 - l) : Math.min(90, l + 20)
      newS = Math.min(s * 1.1, 100) // slightly boost saturation
      break

    case 'blockquote':
      // Blockquotes: softer inversion
      newL = l > 50 ? Math.max(12, 100 - l - 8) : Math.min(88, 100 - l + 8)
      newS = Math.max(s * 0.6, 5)
      break

    case 'link':
      // Links: preserve hue, adjust lightness for dark bg readability
      newL = l < 40 ? Math.min(80, l + 35) : Math.max(50, l - 10)
      break

    case 'decorative-dark':
      // Low-luminance decorative: protect from over-brightening
      newL = Math.min(70, 100 - l)
      break

    case 'vibrant-protected':
      // High-saturation colors: preserve saturation
      newL = l < 50 ? Math.min(85, 100 - l) : Math.max(15, 100 - l)
      newS = Math.min(s * 1.05, 100)
      break

    default:
      newL = l < 50 ? Math.min(90, 100 - l) : Math.max(10, 100 - l)
  }

  return { h, s: newS, l: newL }
}

function isVibrant(hsl: HSL): boolean {
  return hsl.s > 60 && hsl.l > 20 && hsl.l < 80
}

// ── CSS Parsing & Conversion ──

interface CSSRule {
  selector: string
  body: string
}

function parseCSSRules(css: string): CSSRule[] {
  const rules: CSSRule[] = []
  // Simple CSS parser — handles basic rules, skips @rules and comments
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '') // remove comments
  const ruleRegex = /([^{}@]+)\{([^{}]+)\}/g
  let match

  while ((match = ruleRegex.exec(stripped)) !== null) {
    const selector = match[1].trim()
    const body = match[2].trim()
    if (selector && body) {
      rules.push({ selector, body })
    }
  }

  return rules
}

const COLOR_PROPERTIES = [
  'color',
  'background-color',
  'background',
  'border-color',
  'border-top-color',
  'border-bottom-color',
  'border-left-color',
  'border-right-color',
  'outline-color',
  'text-decoration-color',
  'box-shadow',
]

const COLOR_VALUE_REGEX = /#[0-9a-fA-F]{3,6}\b|rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+)?\s*\)/g

function convertCSSBody(body: string, category: ElementCategory): string {
  let result = body

  // Process each color property
  for (const prop of COLOR_PROPERTIES) {
    const propRegex = new RegExp(`(${prop}\\s*:\\s*)([^;]+)`, 'gi')
    result = result.replace(propRegex, (_match, prefix, value) => {
      const converted = convertColorInValue(value, category)
      return `${prefix}${converted}`
    })
  }

  return result
}

function convertColorInValue(value: string, category: ElementCategory): string {
  return value.replace(COLOR_VALUE_REGEX, (colorStr) => {
    const hsl = parseColor(colorStr)
    if (!hsl) return colorStr

    // Check if vibrant
    const actualCategory = isVibrant(hsl) && category !== 'background' ? 'vibrant-protected' : category

    const inverted = invertLightness(hsl, actualCategory)
    return hslToRgbString(inverted.h, inverted.s, inverted.l)
  })
}

// ── LRU Cache ──

class LRUCache<K, V> {
  private maxSize: number
  private cache = new Map<K, V>()

  constructor(maxSize: number) {
    this.maxSize = maxSize
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key)
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key)
      this.cache.set(key, value)
    }
    return value
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // Delete oldest (first) entry
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }
    this.cache.set(key, value)
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }
}

// Simple hash for cache keys
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return hash.toString(36)
}

const darkCssCache = new LRUCache<string, string>(200)

// ── Main Entry ──

export function convertCssToWeChatDarkMode(css: string): string {
  const cacheKey = simpleHash(css)
  const cached = darkCssCache.get(cacheKey)
  if (cached) return cached

  const rules = parseCSSRules(css)
  const convertedRules: string[] = []

  for (const rule of rules) {
    const category = classifySelector(rule.selector)
    const convertedBody = convertCSSBody(rule.body, category)
    convertedRules.push(`${rule.selector} {\n  ${convertedBody}\n}`)
  }

  // Add dark background override
  const result = convertedRules.join('\n\n')
  darkCssCache.set(cacheKey, result)
  return result
}

// Exported for testing
export { hexToRgb, rgbToHsl, hslToHex, parseColor, invertLightness, classifySelector, simpleHash }
export type { HSL, ElementCategory }
