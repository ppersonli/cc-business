'use client'
import { useState, useCallback, useMemo } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('html-minifier')!

function minifyHtml(html: string, options: { comments: boolean; whitespace: boolean; optionalTags: boolean }): string {
  let result = html

  if (options.comments) {
    result = result.replace(/<!--[\s\S]*?-->/g, '')
  }

  if (options.whitespace) {
    result = result.replace(/>\s+</g, '><')
    result = result.replace(/\s{2,}/g, ' ')
    result = result.replace(/\n/g, '')
    result = result.trim()
  }

  if (options.optionalTags) {
    result = result.replace(/<\/(html|head|body|li|dt|dd|p|thead|th|tbody|tr|td|tfoot|colgroup|option|optgroup)>/gi, '')
  }

  return result
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

export default function HtmlMinifier() {
  const [input, setInput] = useState('')
  const [options, setOptions] = useState({ comments: true, whitespace: true, optionalTags: false })
  const [copied, setCopied] = useState(false)

  const output = useMemo(() => minifyHtml(input, options), [input, options])

  const savings = useMemo(() => {
    if (!input) return null
    const original = input.length
    const minified = output.length
    const saved = original - minified
    const pct = original > 0 ? ((saved / original) * 100).toFixed(1) : '0'
    return { original, minified, saved, pct }
  }, [input, output])

  const copy = useCallback(() => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [output])

  return (
    <ToolLayout tool={tool}>
      <div className="options-row" style={{ flexWrap: 'wrap' }}>
        {Object.entries({ comments: 'Remove Comments', whitespace: 'Remove Whitespace', optionalTags: 'Remove Optional Tags' }).map(([key, label]) => (
          <button
            key={key}
            className="btn btn-sm"
            onClick={() => setOptions(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
            style={{
              background: options[key as keyof typeof options] ? 'var(--accent)' : 'var(--bg-secondary)',
              color: options[key as keyof typeof options] ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${options[key as keyof typeof options] ? 'var(--accent)' : 'var(--border)'}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="tool-grid" style={{ marginTop: 16 }}>
        <div className="tool-panel">
          <div className="panel-header">
            <span>Input HTML</span>
            {savings && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatBytes(savings.original)}</span>}
          </div>
          <div className="panel-body">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste HTML here..."
              style={{
                width: '100%',
                minHeight: 250,
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
            <span>Minified Output</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {savings && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatBytes(savings.minified)}</span>}
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
                minHeight: 250,
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

      {savings && savings.original > 0 && (
        <div style={{
          marginTop: 16,
          padding: '14px 18px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)' }}>Original: <strong style={{ color: 'var(--text-primary)' }}>{formatBytes(savings.original)}</strong></span>
            <span style={{ color: 'var(--text-muted)' }}>Minified: <strong style={{ color: 'var(--text-primary)' }}>{formatBytes(savings.minified)}</strong></span>
            <span style={{ color: 'var(--text-muted)' }}>Saved: <strong style={{ color: '#22c55e' }}>{formatBytes(savings.saved)} ({savings.pct}%)</strong></span>
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
