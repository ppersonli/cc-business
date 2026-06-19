'use client'
import { useState, useMemo } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'

const tool = getToolBySlug('url-parser')!

interface ParsedUrl {
  protocol: string
  username: string
  password: string
  hostname: string
  port: string
  pathname: string
  search: string
  hash: string
  origin: string
  params: [string, string][]
}

function parseUrl(input: string): ParsedUrl | null {
  try {
    const url = new URL(input)
    return {
      protocol: url.protocol,
      username: url.username,
      password: url.password,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      origin: url.origin,
      params: Array.from(url.searchParams.entries()),
    }
  } catch {
    return null
  }
}

const FIELD_META: { key: keyof Omit<ParsedUrl, 'params'>; label: string; color: string }[] = [
  { key: 'protocol', label: 'Protocol', color: '#0ea5e9' },
  { key: 'hostname', label: 'Hostname', color: '#f59e0b' },
  { key: 'port', label: 'Port', color: '#ef4444' },
  { key: 'pathname', label: 'Path', color: '#10b981' },
  { key: 'search', label: 'Query String', color: '#8b5cf6' },
  { key: 'hash', label: 'Fragment/Hash', color: '#ec4899' },
  { key: 'origin', label: 'Origin', color: '#6366f1' },
  { key: 'username', label: 'Username', color: '#14b8a6' },
  { key: 'password', label: 'Password', color: '#dc2626' },
]

export default function UrlParser() {
  const [input, setInput] = useState('https://user:pass@example.com:8080/path/to/page?key=value&foo=bar#section')
  const [copied, setCopied] = useState('')

  const parsed = useMemo(() => parseUrl(input), [input])

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(''), 1500)
  }

  return (
    <ToolLayout tool={tool}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', marginBottom: '8px' }}>
          URL Parser
        </h1>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>
          Parse and break down any URL into its individual components
        </p>

        {/* Input */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#64748b' }}>URL</label>
          <div style={{ position: 'relative' }}>
            <input
              value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="https://example.com/path?key=value#hash"
              style={{ width: '100%', padding: '14px 16px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', fontFamily: 'monospace', boxSizing: 'border-box' }}
            />
            {input && !parsed && (
              <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#ef4444', fontSize: '13px', fontWeight: 600 }}>
                Invalid URL
              </div>
            )}
          </div>
        </div>

        {parsed && (
          <>
            {/* Visual Breakdown */}
            <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '12px' }}>URL Anatomy</div>
              <div style={{ fontFamily: 'monospace', fontSize: '14px', lineHeight: 2, wordBreak: 'break-all' }}>
                <span style={{ backgroundColor: '#0ea5e930', padding: '2px 4px', borderRadius: '3px' }}>{parsed.protocol}//</span>
                {parsed.username && (
                  <>
                    <span style={{ backgroundColor: '#14b8a630', padding: '2px 4px', borderRadius: '3px' }}>{parsed.username}</span>
                    {parsed.password && <span style={{ backgroundColor: '#dc262630', padding: '2px 4px', borderRadius: '3px' }}>:{parsed.password}</span>}
                    <span>@</span>
                  </>
                )}
                <span style={{ backgroundColor: '#f59e0b30', padding: '2px 4px', borderRadius: '3px' }}>{parsed.hostname}</span>
                {parsed.port && <span style={{ backgroundColor: '#ef444430', padding: '2px 4px', borderRadius: '3px' }}>:{parsed.port}</span>}
                <span style={{ backgroundColor: '#10b98130', padding: '2px 4px', borderRadius: '3px' }}>{parsed.pathname}</span>
                {parsed.search && <span style={{ backgroundColor: '#8b5cf630', padding: '2px 4px', borderRadius: '3px' }}>{parsed.search}</span>}
                {parsed.hash && <span style={{ backgroundColor: '#ec489930', padding: '2px 4px', borderRadius: '3px' }}>{parsed.hash}</span>}
              </div>
            </div>

            {/* Components Table */}
            <div style={{ marginBottom: '24px', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', backgroundColor: '#f1f5f9', fontSize: '14px', fontWeight: 600 }}>Components</div>
              {FIELD_META.map(field => {
                const value = parsed[field.key]
                if (!value) return null
                return (
                  <div key={field.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: field.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569', minWidth: '90px' }}>{field.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <code style={{ fontSize: '13px', fontFamily: 'monospace', color: '#1e293b' }}>{value}</code>
                      <button onClick={() => copy(value, field.key)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', color: '#3b82f6', flexShrink: 0 }}>
                        {copied === field.key ? '✓' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Query Parameters */}
            {parsed.params.length > 0 && (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', backgroundColor: '#f1f5f9', fontSize: '14px', fontWeight: 600 }}>
                  Query Parameters ({parsed.params.length})
                </div>
                <div style={{ padding: '4px 0' }}>
                  {parsed.params.map(([key, value], i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderBottom: i < parsed!.params.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <code style={{ fontSize: '13px', fontFamily: 'monospace', fontWeight: 600, color: '#8b5cf6' }}>{key}</code>
                        <span style={{ color: '#94a3b8' }}>=</span>
                        <code style={{ fontSize: '13px', fontFamily: 'monospace', color: '#475569' }}>{decodeURIComponent(value)}</code>
                      </div>
                      <button onClick={() => copy(`${key}=${value}`, `param-${i}`)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', color: '#3b82f6' }}>
                        {copied === `param-${i}` ? '✓' : 'Copy'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reconstructed URLs */}
            <div style={{ marginTop: '24px', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', backgroundColor: '#f1f5f9', fontSize: '14px', fontWeight: 600 }}>Reconstructed URLs</div>
              {[
                { label: 'Full URL', url: input },
                { label: 'Without Query', url: `${parsed.origin}${parsed.pathname}${parsed.hash}` },
                { label: 'Without Hash', url: `${parsed.origin}${parsed.pathname}${parsed.search}` },
                { label: 'Base Only', url: `${parsed.origin}${parsed.pathname}` },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>{item.label}</span>
                    <div style={{ fontSize: '13px', fontFamily: 'monospace', color: '#475569', marginTop: '2px' }}>{item.url}</div>
                  </div>
                  <button onClick={() => copy(item.url, item.label)}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', color: '#3b82f6', flexShrink: 0 }}>
                    {copied === item.label ? '✓' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
