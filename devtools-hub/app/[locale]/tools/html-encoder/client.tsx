'use client'
import { useState, useCallback } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('html-encoder')!

const NAMED_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  ' ': '&nbsp;',
  '©': '&copy;',
  '®': '&reg;',
  '™': '&trade;',
  '€': '&euro;',
  '£': '&pound;',
  '¥': '&yen;',
  '°': '&deg;',
  '±': '&plusmn;',
  '×': '&times;',
  '÷': '&divide;',
  '→': '&rarr;',
  '←': '&larr;',
  '↑': '&uarr;',
  '↓': '&darr;',
  '…': '&hellip;',
  '—': '&mdash;',
  '–': '&ndash;',
  '«': '&laquo;',
  '»': '&raquo;',
  '•': '&bull;',
  '§': '&sect;',
  '¶': '&para;',
}

const REVERSE_ENTITIES: Record<string, string> = Object.fromEntries(
  Object.entries(NAMED_ENTITIES).map(([k, v]) => [v, k])
)

function encodeHtml(text: string, mode: 'named' | 'numeric'): string {
  return text.replace(/[^A-Za-z0-9\s]/g, (ch) => {
    if (mode === 'named' && NAMED_ENTITIES[ch]) {
      return NAMED_ENTITIES[ch]
    }
    return `&#${ch.codePointAt(0)};`
  })
}

function decodeHtml(text: string): string {
  let result = text
  result = result.replace(/&[a-zA-Z]+;/g, (match) => REVERSE_ENTITIES[match] ?? match)
  result = result.replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(parseInt(code)))
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
  return result
}

export default function HtmlEncoder() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'encode-named' | 'encode-numeric' | 'decode'>('encode-named')
  const [copied, setCopied] = useState(false)

  const output = mode === 'decode' ? decodeHtml(input) : encodeHtml(input, mode === 'encode-named' ? 'named' : 'numeric')

  const copy = useCallback(() => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [output])

  return (
    <ToolLayout tool={tool}>
      <div className="options-row" style={{ flexWrap: 'wrap' }}>
        {([
          ['encode-named', 'Encode (Named)'],
          ['encode-numeric', 'Encode (Numeric)'],
          ['decode', 'Decode'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            className="btn btn-sm"
            onClick={() => setMode(key)}
            style={{
              background: mode === key ? 'var(--accent)' : 'var(--bg-secondary)',
              color: mode === key ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${mode === key ? 'var(--accent)' : 'var(--border)'}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="tool-grid" style={{ marginTop: 16 }}>
        <div className="tool-panel">
          <div className="panel-header">
            <span>Input</span>
            {input && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{input.length} chars</span>}
          </div>
          <div className="panel-body">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'decode' ? 'Paste encoded HTML here: &amp;lt;div&amp;gt;...' : 'Paste text to encode: <div class="hello">...'}
              style={{
                width: '100%',
                minHeight: 200,
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
          </div>
        </div>

        <div className="tool-panel">
          <div className="panel-header">
            <span>Output</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {output && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{output.length} chars</span>}
              <button className="btn btn-sm" onClick={copy}>
                {copied ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy</>}
              </button>
            </div>
          </div>
          <div className="panel-body">
            <textarea
              value={output}
              readOnly
              style={{
                width: '100%',
                minHeight: 200,
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
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--text-secondary)' }}>Supported entities:</strong>{' '}
        Named: &amp;amp; &amp;lt; &amp;gt; &amp;quot; &amp;copy; &amp;euro; &amp;rarr; and more.{' '}
        Numeric: &amp;#65; (decimal) and &amp;#x41; (hexadecimal).
      </div>
    </ToolLayout>
  )
}
