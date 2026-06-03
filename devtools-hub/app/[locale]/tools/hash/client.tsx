'use client'
import { useState, useMemo } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'
import CryptoJS from 'crypto-js'

const tool = getToolBySlug('hash')!

const ALGORITHMS = [
  { id: 'MD5', label: 'MD5', fn: (s: string) => CryptoJS.MD5(s).toString() },
  { id: 'SHA1', label: 'SHA-1', fn: (s: string) => CryptoJS.SHA1(s).toString() },
  { id: 'SHA256', label: 'SHA-256', fn: (s: string) => CryptoJS.SHA256(s).toString() },
  { id: 'SHA512', label: 'SHA-512', fn: (s: string) => CryptoJS.SHA512(s).toString() },
  { id: 'SHA224', label: 'SHA-224', fn: (s: string) => CryptoJS.SHA224(s).toString() },
  { id: 'SHA384', label: 'SHA-384', fn: (s: string) => CryptoJS.SHA384(s).toString() },
  { id: 'RIPEMD160', label: 'RIPEMD-160', fn: (s: string) => CryptoJS.RIPEMD160(s).toString() },
]

export default function HashCalculator() {
  const [input, setInput] = useState('')
  const [copiedAlgo, setCopiedAlgo] = useState<string | null>(null)

  const results = useMemo(() => {
    if (!input) return ALGORITHMS.map(a => ({ ...a, hash: '' }))
    return ALGORITHMS.map(a => ({ ...a, hash: a.fn(input) }))
  }, [input])

  const copy = async (hash: string, algo: string) => {
    await navigator.clipboard.writeText(hash)
    setCopiedAlgo(algo)
    setTimeout(() => setCopiedAlgo(null), 1500)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="tool-panel" style={{ marginBottom: 16 }}>
        <div className="panel-header">
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Input</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{input.length} chars</span>
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Enter text to hash..."
            style={{ border: 'none', borderRadius: 0, minHeight: 120, padding: 16 }}
            spellCheck={false}
          />
        </div>
      </div>

      <div className="tool-panel">
        <div className="panel-header">
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Hashes</span>
          <button className="btn btn-sm" onClick={() => { setInput('') }}>Clear</button>
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          {results.map((r, i) => (
            <div key={r.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderBottom: i < results.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{
                fontSize: 12, fontWeight: 600, color: 'var(--accent)',
                background: 'rgba(59,130,246,0.1)',
                padding: '2px 8px', borderRadius: 4, minWidth: 90, textAlign: 'center',
              }}>
                {r.label}
              </span>
              <code style={{
                flex: 1, fontSize: 12, color: r.hash ? 'var(--text-primary)' : 'var(--text-muted)',
                wordBreak: 'break-all', lineHeight: 1.4,
              }}>
                {r.hash || '—'}
              </code>
              {r.hash && (
                <button className="btn btn-sm" onClick={() => copy(r.hash, r.id)} style={{ flexShrink: 0 }}>
                  {copiedAlgo === r.id ? <><CheckIcon /></> : <><CopyIcon /></>}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}
