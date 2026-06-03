// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

'use client'

import { useMemo, useRef, forwardRef, useEffect } from 'react'
import { createParser } from '../../../lib/wemd/parser'
import { useThemeStore } from '../../../lib/wemd/stores/themeStore'
import { useSettingsStore } from '../../../lib/wemd/stores/settingsStore'
import { getAllThemes } from '../../../lib/wemd/themes'
import type { Theme } from '../../../lib/wemd/types'

const parser = createParser()

interface MarkdownPreviewProps {
  content: string
  wechatMode?: boolean
}

const MarkdownPreview = forwardRef<HTMLDivElement, MarkdownPreviewProps>(
  ({ content, wechatMode }, ref) => {
    const { currentThemeId, customThemes } = useThemeStore()
    const { isDarkUI } = useSettingsStore()
    const contentRef = useRef<HTMLDivElement>(null)

    const html = useMemo(() => parser.render(content), [content])
    const allThemes = getAllThemes(customThemes)
    const theme = allThemes.find((t: Theme) => t.id === currentThemeId)
    const themeCSS = theme?.css || ''

    const bg = isDarkUI ? '#0f172a' : '#ffffff'

    // Initialize mermaid diagrams after render
    useEffect(() => {
      const el = contentRef.current
      if (!el) return

      const mermaidEls = el.querySelectorAll('.mermaid')
      if (mermaidEls.length === 0) return

      // Dynamic import mermaid (client-side only)
      import('mermaid').then(({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          theme: isDarkUI ? 'dark' : 'default',
          securityLevel: 'loose',
        })

        mermaidEls.forEach(async (mEl, i) => {
          const code = mEl.textContent || ''
          if (!code.trim()) return
          try {
            const { svg } = await mermaid.render(`mermaid-${Date.now()}-${i}`, code)
            mEl.innerHTML = svg
          } catch {
            // mermaid parse error — leave as-is
          }
        })
      }).catch(() => {
        // mermaid not available
      })
    }, [html, isDarkUI])

    return (
      <div
        ref={ref}
        style={{
          height: '100%',
          overflow: 'auto',
          backgroundColor: bg,
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
        <style dangerouslySetInnerHTML={{ __html: `
          .wemd-preview .footnotes { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 14px; }
          .wemd-preview .footnotes ol { padding-left: 20px; }
          .wemd-preview .footnotes li { margin-bottom: 4px; color: #64748b; }
          .wemd-preview .katex-display { margin: 16px 0; overflow-x: auto; }
          .wemd-preview .katex { font-size: 1.1em; }
          .wemd-preview .mermaid { margin: 16px 0; text-align: center; }
          .wemd-preview .mermaid svg { max-width: 100%; }
          ${isDarkUI ? `
            .wemd-preview .footnotes { border-top-color: #334155; }
            .wemd-preview .footnotes li { color: #94a3b8; }
          ` : ''}
        ` }} />
        <div
          ref={contentRef}
          className="wemd-preview"
          style={{
            maxWidth: wechatMode ? '375px' : '780px',
            margin: '0 auto',
            padding: wechatMode ? '16px' : '24px 32px',
            minHeight: '100%',
            boxShadow: wechatMode ? '0 0 20px rgba(0,0,0,0.1)' : 'none',
            borderRadius: wechatMode ? '8px' : '0',
            marginTop: wechatMode ? '16px' : '0',
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    )
  }
)

MarkdownPreview.displayName = 'MarkdownPreview'
export default MarkdownPreview
