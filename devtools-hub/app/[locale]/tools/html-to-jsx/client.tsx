'use client'
import { useState } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('html-to-jsx')!

const ATTR_MAP: Record<string, string> = {
  class: 'className',
  for: 'htmlFor',
  tabindex: 'tabIndex',
  readonly: 'readOnly',
  maxlength: 'maxLength',
  cellspacing: 'cellSpacing',
  cellpadding: 'cellPadding',
  rowspan: 'rowSpan',
  colspan: 'colSpan',
  enctype: 'encType',
  contenteditable: 'contentEditable',
  crossorigin: 'crossOrigin',
  accesskey: 'accessKey',
  allowfullscreen: 'allowFullScreen',
  autocomplete: 'autoComplete',
  autofocus: 'autoFocus',
  autoplay: 'autoPlay',
  formaction: 'formAction',
  novalidate: 'noValidate',
  spellcheck: 'spellCheck',
  srcdoc: 'srcDoc',
  srcset: 'srcSet',
  datetime: 'dateTime',
}

const SELF_CLOSING = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
])

function htmlToJsx(html: string): string {
  let result = html

  // Convert HTML comments to JSX comments
  result = result.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}')

  // Convert attribute names
  for (const [htmlAttr, jsxAttr] of Object.entries(ATTR_MAP)) {
    const regex = new RegExp(`\\b${htmlAttr}=`, 'g')
    result = result.replace(regex, `${jsxAttr}=`)
  }

  // Convert style="..." to style={{ ... }}
  result = result.replace(/style="([^"]*)"/g, (_match, styleStr) => {
    const camelStyle = styleStr
      .split(';')
      .filter((s: string) => s.trim())
      .map((s: string) => {
        const [prop, ...vals] = s.split(':')
        if (!prop || vals.length === 0) return ''
        const camelProp = prop.trim().replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase())
        return `${camelProp}: '${vals.join(':').trim()}'`
      })
      .filter(Boolean)
      .join(', ')
    return `style={{ ${camelStyle} }}`
  })

  // Make self-closing tags self-closing in JSX
  for (const tag of SELF_CLOSING) {
    const regex = new RegExp(`<${tag}([^/]*?)>`, 'gi')
    result = result.replace(regex, `<${tag}$1 />`)
  }

  // Convert & entities to JSX-compatible form (already valid in JSX)

  return result
}

export default function HtmlToJsx() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const handleConvert = () => {
    setOutput(htmlToJsx(input))
  }

  const handleCopy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolLayout tool={tool}>
      <div style={{ marginBottom: 16 }}>
        <div className="options-row">
          <button className="btn btn-primary" onClick={handleConvert}>Convert to JSX</button>
          <button className="btn" onClick={() => { setInput(''); setOutput(''); }}>Clear</button>
          {output && (
            <button className="btn" onClick={handleCopy} style={{ marginLeft: 'auto' }}>
              {copied ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
            </button>
          )}
        </div>
      </div>

      <div className="tool-grid">
        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>HTML Input</span>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={'<div class="container">\n  <label for="name">Name:</label>\n  <input type="text" maxlength="50" />\n  <img src="photo.jpg" />\n</div>'}
              style={{ border: 'none', borderRadius: 0, minHeight: 300, padding: 16 }}
              spellCheck={false}
            />
          </div>
        </div>

        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>JSX Output</span>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <pre style={{
              padding: 16,
              minHeight: 300,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              margin: 0,
              fontSize: 13,
            }}>
              {output || <span style={{ color: 'var(--text-muted)' }}>JSX output will appear here...</span>}
            </pre>
          </div>
        </div>
      </div>

      <div className="tool-panel" style={{ marginTop: 24 }}>
        <div className="panel-header">
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Conversions Applied</span>
        </div>
        <div className="panel-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12, fontSize: 14 }}>
            <div><code style={{ color: '#3b82f6' }}>class</code> → <code style={{ color: '#22c55e' }}>className</code></div>
            <div><code style={{ color: '#3b82f6' }}>for</code> → <code style={{ color: '#22c55e' }}>htmlFor</code></div>
            <div><code style={{ color: '#3b82f6' }}>style="..."</code> → <code style={{ color: '#22c55e' }}>style={'{ ... }'}</code></div>
            <div><code style={{ color: '#3b82f6' }}>{"<!-- comment -->"}</code> → <code style={{ color: '#22c55e' }}>{'{/* comment */}'}</code></div>
            <div><code style={{ color: '#3b82f6' }}>{'<br>'}</code> → <code style={{ color: '#22c55e' }}>{'<br />'}</code></div>
            <div><code style={{ color: '#3b82f6' }}>tabindex</code> → <code style={{ color: '#22c55e' }}>tabIndex</code></div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
