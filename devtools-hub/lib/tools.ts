export interface Tool {
  name: string
  slug: string
  description: string
  category: string
  color: string
}

export const tools: Tool[] = [
  { name: 'JSON Formatter', slug: 'json-formatter', description: 'Format, validate, and minify JSON data instantly', category: 'Data', color: '#f59e0b' },
  { name: 'Base64 Encoder/Decoder', slug: 'base64', description: 'Encode and decode Base64 strings with UTF-8 support', category: 'Encoding', color: '#8b5cf6' },
  { name: 'URL Encoder/Decoder', slug: 'urls', description: 'Encode and decode URLs and URI components', category: 'Encoding', color: '#ec4899' },
  { name: 'Hash Calculator', slug: 'hash', description: 'Generate MD5, SHA-1, SHA-256, and SHA-512 hashes', category: 'Crypto', color: '#14b8a6' },
  { name: 'Regex Tester', slug: 'regex-tester', description: 'Test regular expressions with real-time match highlighting', category: 'Code', color: '#3b82f6' },
  { name: 'QR Code Generator', slug: 'qr', description: 'Generate QR codes for URLs, text, and contact info', category: 'Utility', color: '#06b6d4' },
  { name: 'UUID Generator', slug: 'uuid-generator', description: 'Generate v4 UUIDs with batch generation up to 100 at once', category: 'Utility', color: '#8b5cf6' },
  { name: 'JWT Decoder', slug: 'jwt-decoder', description: 'Decode JWT tokens, inspect header/payload, and validate expiration', category: 'Crypto', color: '#10b981' },
  { name: 'Password Generator', slug: 'password-generator', description: 'Generate secure passwords with customizable length and character sets', category: 'Crypto', color: '#f43f5e' },
  { name: 'Timestamp Converter', slug: 'timestamp', description: 'Convert between Unix timestamps and human-readable dates with live clock and batch support', category: 'Utility', color: '#0ea5e9' },
  { name: 'Unit Converter', slug: 'unit-converter', description: 'Convert between units of length, weight, temperature, volume, speed, and data storage', category: 'Utility', color: '#3b82f6' },
  { name: 'Color Picker', slug: 'color-picker', description: 'Pick colors with HEX, RGB, HSL values and generate CSS code', category: 'Design', color: '#ec4899' },
  { name: 'Markdown Preview', slug: 'markdown', description: 'Preview Markdown with live rendering and syntax highlighting', category: 'Code', color: '#22c55e' },
  { name: 'CSS Minifier', slug: 'css-minifier', description: 'Compress CSS by removing whitespace, comments, and redundant code', category: 'Code', color: '#6366f1' },
  { name: 'HTML Minifier', slug: 'html-minifier', description: 'Compress HTML by removing whitespace, comments, and optional tags with size comparison', category: 'Code', color: '#a855f7' },
  { name: 'Diff Checker', slug: 'diff-checker', description: 'Compare two texts side by side and highlight additions, deletions, and changes', category: 'Code', color: '#84cc16' },
  { name: 'JSON Schema Validator', slug: 'json-schema-validator', description: 'Validate JSON data against a JSON Schema with detailed error reporting', category: 'Data', color: '#d946ef' },
  { name: 'HTML Encoder/Decoder', slug: 'html-encoder', description: 'Encode and decode HTML entities including named and numeric references', category: 'Encoding', color: '#f43f5e' },
  { name: 'Markdown to HTML', slug: 'markdown-to-html', description: 'Convert Markdown to HTML with live preview and copyable output', category: 'Code', color: '#22c55e' },
  { name: 'IP Address Lookup', slug: 'ip-lookup', description: 'Show your public IP address and lookup geolocation for any IP using free API', category: 'Network', color: '#6366f1' },
  { name: 'API Tester', slug: 'api-tester', description: 'Test API endpoints with method selector, custom headers, request body, and response inspection', category: 'Network', color: '#14b8a6' },
  { name: 'Color Converter', slug: 'colors', description: 'Convert between HEX, RGB, HSL, and CMYK color formats', category: 'Design', color: '#f97316' },
  { name: 'Color Palette Generator', slug: 'color-palette', description: 'Generate harmonious color palettes from a base color using complementary, triadic, and analogous schemes', category: 'Design', color: '#a855f7' },
  { name: 'JavaScript Formatter', slug: 'js-formatter', description: 'Format, beautify, and minify JavaScript code with proper indentation', category: 'Code', color: '#eab308' },
  { name: 'CSS Flexbox Generator', slug: 'css-flexbox', description: 'Generate CSS Flexbox layouts visually with live preview and copyable code', category: 'Design', color: '#6366f1' },
  { name: 'Gradient Generator', slug: 'gradient-generator', description: 'Create CSS gradients visually with linear, radial, and conic types plus presets', category: 'Design', color: '#f43f5e' },
  { name: 'Box Shadow Generator', slug: 'box-shadow', description: 'Generate CSS box-shadow code with visual controls, opacity, and inset options', category: 'Design', color: '#6366f1' },
  { name: 'Text Case Converter', slug: 'text-case', description: 'Convert text between uppercase, lowercase, title case, camelCase, snake_case, and more', category: 'Text', color: '#eab308' },
  { name: 'Word Counter', slug: 'word-counter', description: 'Count words, characters, sentences, paragraphs, and estimate reading time', category: 'Text', color: '#06b6d4' },
  { name: 'JSON to Go Struct', slug: 'json-to-go', description: 'Generate Go structs from JSON with json tags, nested types, and pointer options', category: 'Code', color: '#00add8' },
  { name: 'JSON to TypeScript', slug: 'json-to-typescript', description: 'Convert JSON data to TypeScript interfaces with inferred types and nested support', category: 'Code', color: '#3178c6' },
  { name: 'SQL Formatter', slug: 'sql-formatter', description: 'Format, minify, and capitalize SQL queries with proper indentation and keyword highlighting', category: 'Code', color: '#336791' },
  { name: 'Cron Expression Generator', slug: 'cron-generator', description: 'Generate and understand cron schedule expressions with human-readable descriptions and next run times', category: 'Utility', color: '#10b981' },
  { name: 'CSV ⇄ JSON Converter', slug: 'csv-json', description: 'Convert between CSV and JSON formats with proper escaping, headers, and multiple delimiter support', category: 'Data', color: '#f59e0b' },
]

export const categories = [...new Set(tools.map(t => t.category))]

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find(t => t.slug === slug)
}
