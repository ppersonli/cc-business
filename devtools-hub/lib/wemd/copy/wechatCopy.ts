// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

import juice from 'juice'
import { createParser } from '../parser'
import { getThemeById, getAllThemes } from '../themes'
import { convertLinksToFootnotes } from './linkToFootnote'
import type { Theme } from '../types'

const parser = createParser()

function wrapWithTheme(html: string, css: string): string {
  return `<div class="wemd-preview" style="max-width:780px;margin:0 auto;padding:20px;">${html}</div>`
}

function expandCSSVariables(css: string): string {
  // WeChat strips CSS var(), so we can't use any CSS variables.
  // This is a safety net that removes any remaining var() references.
  return css.replace(/var\([^)]+\)/g, 'inherit')
}

export async function copyToWechat(
  markdown: string,
  themeId: string,
  customThemes: Theme[] = [],
  options: { linkToFootnote?: boolean } = {}
): Promise<boolean> {
  try {
    // 1. Parse markdown to HTML
    let html = parser.render(markdown)

    // 1.5 Optional link-to-footnote conversion
    if (options.linkToFootnote) {
      html = convertLinksToFootnotes(html)
    }

    // 2. Get theme CSS
    const allThemes = getAllThemes(customThemes)
    const theme = allThemes.find((t) => t.id === themeId)
    const themeCSS = theme?.css || ''

    // 3. Wrap HTML with theme container
    const themedHtml = wrapWithTheme(html, themeCSS)

    // 4. Expand CSS variables (WeChat strips var())
    const expandedCSS = expandCSSVariables(themeCSS)

    // 5. Build full HTML with inline style tag
    const fullHtml = `<style>${expandedCSS}</style>${themedHtml}`

    // 6. Inline all styles using juice
    const inlinedHtml = juice(fullHtml, {
      preserveMediaQueries: false,
      preserveFontFaces: false,
      removeStyleTags: true,
    })

    // 7. Clean up for WeChat compatibility
    const cleanHtml = inlinedHtml
      .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()

    // 8. Copy to clipboard as rich HTML
    const blob = new Blob([cleanHtml], { type: 'text/html' })
    const plainBlob = new Blob([markdown], { type: 'text/plain' })
    const item = new ClipboardItem({
      'text/html': blob,
      'text/plain': plainBlob,
    })
    await navigator.clipboard.write([item])

    return true
  } catch (err) {
    console.error('Failed to copy to WeChat:', err)
    // Fallback: copy as plain text
    try {
      await navigator.clipboard.writeText(markdown)
      return true
    } catch {
      return false
    }
  }
}

export function exportAsHtml(
  markdown: string,
  themeId: string,
  customThemes: Theme[] = [],
  options: { linkToFootnote?: boolean } = {}
): string {
  let html = parser.render(markdown)
  if (options.linkToFootnote) {
    html = convertLinksToFootnotes(html)
  }
  const allThemes = getAllThemes(customThemes)
  const theme = allThemes.find((t) => t.id === themeId)
  const themeCSS = theme?.css || ''
  const themedHtml = wrapWithTheme(html, themeCSS)
  const expandedCSS = expandCSSVariables(themeCSS)

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>WeChat Article</title>
<style>${expandedCSS}</style>
</head>
<body style="margin:0;padding:20px;background:#f5f5f5;">
${themedHtml}
</body>
</html>`
}
