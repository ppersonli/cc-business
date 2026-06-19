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

// Generate a slug from heading text for anchor links
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    || 'heading'
}

// Custom [toc] plugin: collect headings and generate TOC
function tocPlugin(md: MarkdownIt) {
  // Collect headings during parsing
  const headings: { level: number; text: string; slug: string }[] = []
  const slugCounts: Record<string, number> = {}

  function uniqueSlug(base: string): string {
    if (slugCounts[base] === undefined) {
      slugCounts[base] = 0
      return base
    }
    slugCounts[base]++
    return `${base}-${slugCounts[base]}`
  }

  // Add IDs to heading tokens
  md.core.ruler.push('heading-anchors', (state) => {
    headings.length = 0
    Object.keys(slugCounts).forEach((k) => delete slugCounts[k])

    for (let i = 0; i < state.tokens.length; i++) {
      const token = state.tokens[i]
      if (token.type === 'heading_open') {
        const level = parseInt(token.tag.slice(1), 10)
        // Get heading text from next inline token
        const inlineToken = state.tokens[i + 1]
        const text = inlineToken ? inlineToken.content : ''
        const slug = uniqueSlug(slugify(text))
        headings.push({ level, text, slug })
        token.attrSet('id', slug)
      }
    }
  })

  // Replace [toc] blocks with TOC HTML
  md.core.ruler.push('toc-replace', (state) => {
    for (let i = 0; i < state.tokens.length; i++) {
      const token = state.tokens[i]
      if (token.type === 'inline' && /^\s*\[toc\]\s*$/i.test(token.content)) {
        // Build TOC HTML from h2/h3 headings
        const tocItems = headings.filter((h) => h.level === 2 || h.level === 3)
        if (tocItems.length === 0) {
          // Replace with empty
          state.tokens[i].type = 'html_inline'
          state.tokens[i].content = '<div class="wemd-toc" style="padding:12px;color:#999;font-size:14px;">📑 暂无目录（需要 h2/h3 标题）</div>'
          continue
        }

        let html = '<nav class="wemd-toc" style="margin:16px 0;padding:16px 20px;background:#f8f9fa;border:1px solid #e2e8f0;border-radius:8px;">'
        html += '<div style="font-weight:600;font-size:15px;margin-bottom:10px;color:#333;">📑 目录</div>'
        html += '<ul style="list-style:none;padding:0;margin:0;">'
        for (const h of tocItems) {
          const indent = h.level === 3 ? 'padding-left:20px;' : ''
          const fontSize = h.level === 3 ? 'font-size:13px;' : 'font-size:14px;'
          const fontWeight = h.level === 2 ? 'font-weight:500;' : ''
          html += `<li style="margin:4px 0;${indent}"><a href="#${h.slug}" style="color:#0366d6;text-decoration:none;${fontSize}${fontWeight}">${md.utils.escapeHtml(h.text)}</a></li>`
        }
        html += '</ul></nav>'

        state.tokens[i].type = 'html_inline'
        state.tokens[i].content = html
      }
    }
  })
}

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

    // Mac code bar with traffic light dots
    const langLabel = lang ? `<span class="wemd-code-lang">${md.utils.escapeHtml(lang)}</span>` : ''
    const codeBar = `<div class="wemd-code-bar"><span class="wemd-code-dot" style="background:#ff5f56"></span><span class="wemd-code-dot" style="background:#ffbd2e"></span><span class="wemd-code-dot" style="background:#27c93f"></span>${langLabel}</div>`

    if (lang && hljs.getLanguage(lang)) {
      try {
        const result = hljs.highlight(str, { language: lang, ignoreIllegals: true })
        return `<div class="wemd-code-block">${codeBar}<pre class="hljs"><code>${result.value}</code></pre></div>`
      } catch {
        // fall through
      }
    }
    const escaped: string = md.utils.escapeHtml(str)
    return `<div class="wemd-code-block">${codeBar}<pre class="hljs"><code>${escaped}</code></pre></div>`
  }

  // GFM tables
  md.enable('table')

  // KaTeX math
  md.use(katex)

  // Footnotes
  md.use(footnote)

  // Table of Contents [toc]
  md.use(tocPlugin)

  // Sliding image groups: wrap consecutive image paragraphs in horizontal scroll container
  md.core.ruler.push('image-flow', (state) => {
    const tokens = state.tokens
    let i = 0
    while (i < tokens.length) {
      // Check if this is a paragraph containing only images
      if (tokens[i].type === 'paragraph_open' && i + 2 < tokens.length) {
        const inline = tokens[i + 1]
        const close = tokens[i + 2]
        if (inline.type === 'inline' && close.type === 'paragraph_close') {
          const childTokens = inline.children || []
          const isImageOnly = childTokens.length > 0 &&
            childTokens.every((c: { type: string; content?: string }) => c.type === 'image' || c.type === 'text' && !c.content?.trim())
          if (isImageOnly && childTokens.some((c: { type: string }) => c.type === 'image')) {
            // Check if next paragraph is also image-only
            let j = i + 3
            let imageCount = 1
            while (j + 2 < tokens.length) {
              const nextInline = tokens[j + 1]
              const nextClose = tokens[j + 2]
              if (tokens[j].type === 'paragraph_open' && nextInline?.type === 'inline' && nextClose?.type === 'paragraph_close') {
                const nextChildren = nextInline.children || []
                const nextIsImage = nextChildren.length > 0 &&
                  nextChildren.every((c: { type: string; content?: string }) => c.type === 'image' || c.type === 'text' && !c.content?.trim()) &&
                  nextChildren.some((c: { type: string }) => c.type === 'image')
                if (nextIsImage) {
                  imageCount++
                  j += 3
                } else break
              } else break
            }
            // If 2+ consecutive image paragraphs, wrap in image-flow container
            if (imageCount >= 2) {
              const openToken = new state.Token('html_block', '', 0)
              openToken.content = '<div class="wemd-image-flow" style="display:flex;overflow-x:auto;gap:8px;padding:8px 0;-webkit-overflow-scrolling:touch;scroll-snap-type:x mandatory;">'
              const closeToken2 = new state.Token('html_block', '', 0)
              closeToken2.content = '</div>'
              // Wrap: insert open before first, close after last
              tokens.splice(i, 0, openToken)
              tokens.splice(i + 1 + imageCount * 3, 0, closeToken2)
              // Add snap-align + max-width to each image paragraph's inline tokens
              for (let k = 0; k < imageCount; k++) {
                const idx = i + 2 + k * 3 // inline token index
                const children = tokens[idx].children || []
                for (const child of children) {
                  if (child.type === 'image') {
                    child.attrSet('style', 'max-width:80%;min-width:200px;height:auto;border-radius:6px;scroll-snap-align:start;flex-shrink:0;object-fit:cover;')
                  }
                }
              }
              i = i + 2 + imageCount * 3 + 1
              continue
            }
          }
        }
      }
      i++
    }
  })

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
