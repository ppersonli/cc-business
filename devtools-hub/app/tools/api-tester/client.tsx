'use client'
import { useState, useCallback } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('api-tester')!

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const

type Method = typeof METHODS[number]

interface ApiResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  time: number
  size: string
}

export default function ApiTester() {
  const [method, setMethod] = useState<Method>('GET')
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1')
  const [headers, setHeaders] = useState('Content-Type: application/json')
  const [body, setBody] = useState('')
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const send = useCallback(async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const headerObj: Record<string, string> = {}
      headers.split('\n').forEach(line => {
        const idx = line.indexOf(':')
        if (idx > 0) {
          headerObj[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
        }
      })

      const init: RequestInit = {
        method,
        headers: headerObj,
      }

      if (body.trim() && method !== 'GET' && method !== 'DELETE') {
        init.body = body
      }

      const start = performance.now()
      const res = await fetch(url, init)
      const elapsed = Math.round(performance.now() - start)

      const text = await res.text()
      const resHeaders: Record<string, string> = {}
      res.headers.forEach((v, k) => { resHeaders[k] = v })

      const size = new Blob([text]).size
      const sizeStr = size < 1024 ? size + ' B' : (size / 1024).toFixed(1) + ' KB'

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: resHeaders,
        body: text,
        time: elapsed,
        size: sizeStr,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }, [method, url, headers, body])

  const copyResponse = useCallback(() => {
    if (response) {
      navigator.clipboard.writeText(response.body)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }, [response])

  const formatBody = useCallback(() => {
    if (!response) return ''
    try {
      return JSON.stringify(JSON.parse(response.body), null, 2)
    } catch {
      return response.body
    }
  }, [response])

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return '#22c55e'
    if (status >= 300 && status < 400) return '#eab308'
    if (status >= 400 && status < 500) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <ToolLayout tool={tool}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as Method)}
          style={{ padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)' }}
        >
          {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/endpoint"
          style={{ flex: 1, padding: '8px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 13 }}
        />
        <button className="btn btn-primary" onClick={send} disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

      <div className="tool-grid">
        <div className="tool-panel">
          <div className="panel-header">
            <span>Headers</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>One per line: Key: Value</span>
          </div>
          <div className="panel-body">
            <textarea
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              placeholder="Content-Type: application/json"
              style={{ width: '100%', minHeight: 80, padding: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12, resize: 'vertical' }}
            />
          </div>
        </div>

        <div className="tool-panel">
          <div className="panel-header">
            <span>Body</span>
            {method === 'GET' && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Not sent for GET</span>}
          </div>
          <div className="panel-body">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={'{"key": "value"}'}
              style={{ width: '100%', minHeight: 80, padding: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12, resize: 'vertical' }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#fca5a5', fontSize: 13 }}>
          {error}
        </div>
      )}

      {response && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: getStatusColor(response.status), fontFamily: 'var(--font-mono)' }}>
              {response.status} {response.statusText}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{response.time}ms</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{response.size}</span>
            <button className="btn btn-sm" onClick={copyResponse} style={{ marginLeft: 'auto' }}>
              {copied ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy</>}
            </button>
          </div>

          <div className="tool-panel">
            <div className="panel-header">
              <span>Response Body</span>
            </div>
            <div className="panel-body">
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: 13, lineHeight: 1.5 }}>
                {formatBody()}
              </pre>
            </div>
          </div>

          <details style={{ marginTop: 8 }}>
            <summary style={{ cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)', padding: '8px 0' }}>
              Response Headers ({Object.keys(response.headers).length})
            </summary>
            <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, fontFamily: 'var(--font-mono)' }}>
              {Object.entries(response.headers).map(([k, v]) => (
                <div key={k} style={{ padding: '2px 0', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--accent)' }}>{k}</span>: {v}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </ToolLayout>
  )
}
