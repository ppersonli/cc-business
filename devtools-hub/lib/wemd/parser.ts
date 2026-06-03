// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import container from 'markdown-it-container'
import deflist from 'markdown-it-deflist'
import { full as emoji } from 'markdown-it-emoji'
import taskLists from 'markdown-it-task-lists'
import mark from 'markdown-it-mark'
import sub from 'markdown-it-sub'
import sup from 'markdown-it-sup'
import katex from 'markdown-it-katex'
import footnote from 'markdown-it-footnote'

export function createParser(): MarkdownIt {
  const md: MarkdownIt = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
  })

  // Syntax highlighting
  md.options.highlight = function (str: string, lang: string): string {
    // Mermaid blocks: output as div for client-side rendering
    if (lang === 'mermaid') {
      return `<div class="mermaid">${md.utils.escapeHtml(str)}</div>`
    }
    if (lang && hljs.getLanguage(lang)) {
      try {
        const result = hljs.highlight(str, { language: lang, ignoreIllegals: true })
        return `<pre class="hljs"><code>${result.value}</code></pre>`
      } catch {
        // fall through
      }
    }
    const escaped: string = md.utils.escapeHtml(str)
    return `<pre class="hljs"><code>${escaped}</code></pre>`
  }

  // GFM tables
  md.enable('table')

  // KaTeX math
  md.use(katex)

  // Footnotes
  md.use(footnote)

  // Alert/callout containers
  const alertTypes = [
    { name: 'tip', label: '提示', color: '#07c160', icon: '💡' },
    { name: 'info', label: '备注', color: '#576b95', icon: 'ℹ️' },
    { name: 'warning', label: '警告', color: '#e6a23c', icon: '⚠️' },
    { name: 'danger', label: '危险', color: '#f56c6c', icon: '🚨' },
  ]

  for (const alert of alertTypes) {
    md.use(container, alert.name, {
      validate: (params: string) => params.trim().startsWith(alert.name),
      render: (tokens: Array<{ info: string; nesting: number }>, idx: number) => {
        if (tokens[idx].nesting === 1) {
          const info = tokens[idx].info.trim()
          const title = info.slice(alert.name.length).trim() || alert.label
          return `<div class="wemd-alert wemd-alert-${alert.name}" style="border-left:4px solid ${alert.color};background:${alert.color}10;padding:12px 16px;margin:16px 0;border-radius:4px;">
<span class="wemd-alert-title" style="font-weight:600;color:${alert.color};display:block;margin-bottom:4px;">${alert.icon} ${title}</span>\n`
        }
        return '</div>\n'
      },
    })
  }

  // Legacy warning/info containers (kept for backwards compat)
  md.use(container, 'warning-legacy', {
    validate: (params: string) => params.trim().startsWith('warning-legacy'),
    render: (tokens: Array<{ info: string; nesting: number }>, idx: number) => {
      if (tokens[idx].nesting === 1) {
        return '<blockquote class="warning-block">\n'
      }
      return '</blockquote>\n'
    },
  })

  md.use(deflist)
  md.use(emoji)
  md.use(taskLists, { enabled: true, label: true })
  md.use(mark)
  md.use(sub)
  md.use(sup)

  // Underline: <u>text</u> support
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  md.inline.ruler.push('underline', (state: any) => {
    const start = state.pos
    if (state.src.charCodeAt(start) !== 0x3C) return false
    if (state.src.slice(start, start + 3).toLowerCase() !== '<u>') return false
    const end = state.src.indexOf('</u>', start)
    if (end === -1) return false
    const token = state.push('underline_open', 'u', 1)
    token.markup = '<u>'
    const textToken = state.push('text', '', 0)
    textToken.content = state.src.slice(start + 3, end)
    const closeToken = state.push('underline_close', 'u', -1)
    closeToken.markup = '</u>'
    state.pos = end + 4
    return true
  })

  return md
}
