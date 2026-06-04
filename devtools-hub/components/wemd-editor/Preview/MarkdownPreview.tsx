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
          } catch (err) {
            // Show friendly error fallback instead of raw mermaid error
            const errMsg = err instanceof Error ? err.message : String(err)
            mEl.innerHTML = `<div style="padding:12px 16px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;color:#991b1b;font-size:13px;text-align:left;max-width:100%;overflow:auto;">
              <div style="font-weight:600;margin-bottom:4px;">⚠️ Mermaid 渲染失败</div>
              <div style="font-size:12px;color:#666;word-break:break-all;">${errMsg.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
              <details style="margin-top:8px;"><summary style="cursor:pointer;font-size:12px;color:#991b1b;">查看原始代码</summary><pre style="margin-top:4px;padding:8px;background:#fff;border-radius:4px;font-size:11px;overflow-x:auto;white-space:pre-wrap;">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></details>
            </div>`
          }
        })
      }).catch(() => {
        // mermaid not available — show placeholder
        mermaidEls.forEach((mEl) => {
          const code = mEl.textContent || ''
          if (!code.trim()) return
          mEl.innerHTML = `<div style="padding:8px 12px;background:#f1f5f9;border-radius:6px;color:#64748b;font-size:12px;text-align:center;">📊 Mermaid 图表 (需要客户端渲染)</div>`
        })
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
          .wemd-preview .mermaid { margin: 16px 0; text-align: center; overflow: hidden; max-width: 100%; }
          .wemd-preview .mermaid svg { max-width: 100%; height: auto; }
          .wemd-preview .mermaid > div { max-width: 100%; overflow: auto; }
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
