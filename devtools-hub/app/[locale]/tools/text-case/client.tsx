'use client'
import { useState, useCallback } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('text-case')!

const CASES = [
  { key: 'upper', label: 'UPPERCASE' },
  { key: 'lower', label: 'lowercase' },
  { key: 'title', label: 'Title Case' },
  { key: 'sentence', label: 'Sentence case' },
  { key: 'camel', label: 'camelCase' },
  { key: 'pascal', label: 'PascalCase' },
  { key: 'snake', label: 'snake_case' },
  { key: 'kebab', label: 'kebab-case' },
  { key: 'constant', label: 'CONSTANT_CASE' },
] as const

type CaseKey = typeof CASES[number]['key']

function toWords(text: string): string[] {
  return text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_\-]+/g, ' ')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

function convert(text: string, caseKey: CaseKey): string {
  if (!text) return ''
  const words = toWords(text)

  switch (caseKey) {
    case 'upper':
      return text.toUpperCase()
    case 'lower':
      return text.toLowerCase()
    case 'title':
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    case 'sentence': {
      const lower = text.toLowerCase()
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    }
    case 'camel':
      return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')
    case 'pascal':
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')
    case 'snake':
      return words.map(w => w.toLowerCase()).join('_')
    case 'kebab':
      return words.map(w => w.toLowerCase()).join('-')
    case 'constant':
      return words.map(w => w.toUpperCase()).join('_')
    default:
      return text
  }
}

export default function TextCaseConverter() {
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const copy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }, [])

  return (
    <ToolLayout tool={tool}>
      <div className="tool-panel">
        <div className="panel-header">
          <span>Input Text</span>
          {input && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{input.length} chars</span>}
        </div>
        <div className="panel-body">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste your text here..."
            style={{
              width: '100%',
              minHeight: 100,
              padding: 12,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--text-primary)',
              fontSize: 14,
              resize: 'vertical',
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {CASES.map(({ key, label }) => {
          const output = convert(input, key)
          return (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 8,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', minWidth: 100, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {label}
              </span>
              <span style={{
                flex: 1,
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                color: output ? 'var(--text-primary)' : 'var(--text-muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {output || '—'}
              </span>
              {output && (
                <button className="btn btn-sm" onClick={() => copy(output, key)} style={{ flexShrink: 0 }}>
                  {copied === key ? <CheckIcon /> : <CopyIcon />}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </ToolLayout>
  )
}
