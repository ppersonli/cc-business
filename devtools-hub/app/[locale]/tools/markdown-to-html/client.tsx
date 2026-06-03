'use client'
import { useState, useCallback } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('markdown-to-html')!

const SAMPLE_MD = `# Hello World

This is a **bold** and *italic* text example.

## Features

- Item one
- Item two
- Item three

### Code

\`\`\`js
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

> A blockquote for emphasis.

| Name | Age | City |
|------|-----|------|
| Alice | 30 | NYC |
| Bob | 25 | LA |

[Visit GitHub](https://github.com)
`

function simpleMarkdownToHtml(md: string): string {
  let html = md

  // Code blocks (must be before inline code)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    return `<pre><code class="language-${lang || 'text'}">${escaped.trim()}</code></pre>`
  })

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Headers
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')

  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>')

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>\n${match}</ul>`)

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')

  // Tables
  html = html.replace(/^\|(.+)\|\s*$/gm, (_, content) => {
    const cells = content.split('|').map((c: string) => c.trim())
    if (cells.every((c: string) => /^[-:]+$/.test(c))) return '<!-- table separator -->'
    const isHeader = false
    const tag = 'td'
    const row = cells.map((c: string) => `<${tag}>${c}</${tag}>`).join('')
    return `<tr>${row}</tr>`
  })
  html = html.replace(/((<tr>.*<\/tr>\n?)+)/g, (match) => {
    const cleaned = match.replace(/<!-- table separator -->\n?/g, '')
    if (!cleaned.trim()) return ''
    const firstRowEnd = cleaned.indexOf('</tr>') + 5
    const header = cleaned.slice(0, firstRowEnd).replace(/<td>/g, '<th>').replace(/<\/td>/g, '</th>')
    const body = cleaned.slice(firstRowEnd)
    return `<table>\n<thead>${header}</thead>\n<tbody>${body}</tbody>\n</table>`
  })

  // Horizontal rule
  html = html.replace(/^---+$/gm, '<hr />')

  // Paragraphs (lines not already wrapped in block elements)
  const lines = html.split('\n')
  const result: string[] = []
  let inPre = false
  for (const line of lines) {
    if (line.includes('<pre>')) inPre = true
    if (line.includes('</pre>')) { inPre = false; result.push(line); continue }
    if (inPre) { result.push(line); continue }

    const trimmed = line.trim()
    if (!trimmed) { result.push(''); continue }
    if (trimmed.startsWith('<')) { result.push(trimmed); continue }
    result.push(`<p>${trimmed}</p>`)
  }

  return result.join('\n').replace(/<!-- table separator -->\n?/g, '')
}

export default function MarkdownToHtml() {
  const [input, setInput] = useState(SAMPLE_MD)
  const [useSimple, setUseSimple] = useState(true)
  const [copied, setCopied] = useState(false)
  const [copyTarget, setCopyTarget] = useState<'html' | null>(null)

  const html = simpleMarkdownToHtml(input)

  const copy = useCallback((text: string, target: 'html') => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setCopyTarget(target)
    setTimeout(() => { setCopied(false); setCopyTarget(null) }, 1500)
  }, [])

  return (
    <ToolLayout tool={tool}>
      <div className="tool-grid">
        <div className="tool-panel">
          <div className="panel-header">
            <span>Markdown Input</span>
            {input && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{input.split('\n').length} lines</span>}
          </div>
          <div className="panel-body">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="# Heading\n\n**Bold** and *italic* text..."
              style={{
                width: '100%',
                minHeight: 300,
                padding: 12,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                resize: 'vertical',
                lineHeight: 1.6,
              }}
            />
          </div>
        </div>

        <div className="tool-panel">
          <div className="panel-header">
            <span>HTML Output</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="btn btn-sm" onClick={() => setUseSimple(!useSimple)} style={{ fontSize: 11 }}>
                {useSimple ? 'Source' : 'Preview'}
              </button>
              <button className="btn btn-sm" onClick={() => copy(html, 'html')}>
                {copied && copyTarget === 'html' ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy HTML</>}
              </button>
            </div>
          </div>
          <div className="panel-body">
            {useSimple ? (
              <div
                className="markdown-preview"
                style={{
                  padding: 12,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  minHeight: 300,
                  fontSize: 14,
                  lineHeight: 1.7,
                  overflow: 'auto',
                }}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              <textarea
                value={html}
                readOnly
                style={{
                  width: '100%',
                  minHeight: 300,
                  padding: 12,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  resize: 'vertical',
                }}
              />
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
