'use client'
import { useState, useMemo, useCallback } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('jwt-decoder')!

function base64UrlDecode(str: string): string {
  let s = str.replace(/-/g, '+').replace(/_/g, '/')
  while (s.length % 4) s += '='
  try {
    return atob(s)
  } catch {
    return ''
  }
}

function decodeJwt(token: string): { header: unknown; payload: unknown; signature: string; error?: string } | null {
  const trimmed = token.trim()
  if (!trimmed) return null

  const parts = trimmed.split('.')
  if (parts.length !== 3) {
    return { header: null, payload: null, signature: '', error: 'Invalid JWT: expected 3 parts separated by dots' }
  }

  try {
    const headerJson = base64UrlDecode(parts[0])
    const payloadJson = base64UrlDecode(parts[1])

    if (!headerJson || !payloadJson) {
      return { header: null, payload: null, signature: '', error: 'Invalid Base64 encoding in token' }
    }

    const header = JSON.parse(headerJson)
    const payload = JSON.parse(payloadJson)

    return { header, payload, signature: parts[2] }
  } catch {
    return { header: null, payload: null, signature: '', error: 'Failed to parse JSON in token' }
  }
}

function formatTimestamp(ts: number): string {
  try {
    const date = new Date(ts * 1000)
    return date.toLocaleString()
  } catch {
    return String(ts)
  }
}

export default function JwtDecoder() {
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const result = useMemo(() => decodeJwt(input), [input])

  const copy = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 1500)
  }, [])

  const expiration = useMemo(() => {
    if (!result?.payload || typeof result.payload !== 'object') return null
    const p = result.payload as Record<string, unknown>
    if (typeof p.exp !== 'number') return null
    const now = Math.floor(Date.now() / 1000)
    const expired = p.exp < now
    const remaining = p.exp - now
    return { expired, date: formatTimestamp(p.exp), remaining }
  }, [result])

  const renderSection = (label: string, data: unknown, sectionKey: string) => {
    const json = JSON.stringify(data, null, 2)
    return (
      <div className="tool-panel">
        <div className="panel-header">
          <span>{label}</span>
          <button className="btn btn-sm" onClick={() => copy(json, sectionKey)}>
            {copied === sectionKey ? <CheckIcon /> : <CopyIcon />}
            {copied === sectionKey ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="panel-body">
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: 13 }}>
            {json}
          </pre>
        </div>
      </div>
    )
  }

  return (
    <ToolLayout tool={tool}>
      <div className="tool-panel">
        <div className="panel-header">
          <span>Paste JWT Token</span>
          {input && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {input.split('.').length} parts
            </span>
          )}
        </div>
        <div className="panel-body">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
            style={{
              width: '100%',
              minHeight: 80,
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

      {result?.error && (
        <div style={{
          marginTop: 16,
          padding: '12px 16px',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 8,
          color: '#fca5a5',
          fontSize: 13,
        }}>
          {result.error}
        </div>
      )}

      {result && !result.error && (
        <>
          {expiration && (
            <div style={{
              marginTop: 16,
              padding: '12px 16px',
              background: expiration.expired ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
              border: `1px solid ${expiration.expired ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
              borderRadius: 8,
              fontSize: 13,
            }}>
              <span style={{ color: expiration.expired ? '#fca5a5' : '#86efac', fontWeight: 600 }}>
                {expiration.expired ? 'EXPIRED' : 'VALID'}
              </span>
              <span style={{ color: 'var(--text-secondary)', marginLeft: 12 }}>
                Expires: {expiration.date}
                {!expiration.expired && expiration.remaining > 0 && (
                  <> ({Math.floor(expiration.remaining / 3600)}h {Math.floor((expiration.remaining % 3600) / 60)}m remaining)</>
                )}
              </span>
            </div>
          )}

          <div className="tool-grid" style={{ marginTop: 16 }}>
            {renderSection('Header', result.header, 'header')}
            {renderSection('Payload', result.payload, 'payload')}
          </div>

          <div className="tool-panel" style={{ marginTop: 16 }}>
            <div className="panel-header">
              <span>Signature</span>
              <button className="btn btn-sm" onClick={() => copy(result.signature, 'sig')}>
                {copied === 'sig' ? <CheckIcon /> : <CopyIcon />}
              </button>
            </div>
            <div className="panel-body">
              <pre style={{ margin: 0, wordBreak: 'break-all', fontSize: 13, color: 'var(--text-secondary)' }}>
                {result.signature}
              </pre>
            </div>
          </div>
        </>
      )}
    </ToolLayout>
  )
}
