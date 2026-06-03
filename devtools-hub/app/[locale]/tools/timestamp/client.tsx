'use client'
import { useState, useEffect } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('timestamp')!

export default function TimestampConverter() {
  const [now, setNow] = useState(Math.floor(Date.now() / 1000))
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [mode, setMode] = useState<'now' | 'convert' | 'batch'>('now')
  const [batchInput, setBatchInput] = useState('')
  const [batchResults, setBatchResults] = useState<{ts: string, date: string}[]>([])
  const [tz, setTz] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)

  useEffect(() => {
    const interval = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTS = (ts: number, tzName: string) => {
    try {
      const d = new Date(ts * 1000)
      return d.toLocaleString('en-US', { timeZone: tzName, dateStyle: 'full', timeStyle: 'long' })
    } catch { return 'Invalid' }
  }

  const formatISO = (ts: number, tzName: string) => {
    try {
      const d = new Date(ts * 1000)
      return d.toLocaleString('sv-SE', { timeZone: tzName }).replace(' ', 'T')
    } catch { return 'Invalid' }
  }

  const handleConvert = () => {
    setError('')
    setResult('')
    const val = input.trim()
    if (!val) { setError('Enter a timestamp or date string'); return }

    // Try as timestamp (seconds or milliseconds)
    const num = Number(val)
    if (!isNaN(num) && num > 0) {
      const ts = num > 1e12 ? Math.floor(num / 1000) : num
      const ms = ts * 1000
      if (ms < -62135596800000 || ms > 8640000000000000) {
        setError('Timestamp out of valid range')
        return
      }
      const lines = [
        `ISO 8601:  ${formatISO(ts, tz)}`,
        `UTC:       ${formatTS(ts, 'UTC')}`,
        `Local:     ${formatTS(ts, tz)}`,
        `Unix (s):  ${ts}`,
        `Unix (ms): ${ms}`,
        `Relative:  ${getRelative(ts)}`,
      ].join('\n')
      setResult(lines)
      return
    }

    // Try as date string
    const parsed = new Date(val)
    if (isNaN(parsed.getTime())) {
      setError('Could not parse input. Try a number (e.g. 1700000000) or date (e.g. 2024-01-01)')
      return
    }
    const ts = Math.floor(parsed.getTime() / 1000)
    const lines = [
      `ISO 8601:  ${formatISO(ts, tz)}`,
      `UTC:       ${formatTS(ts, 'UTC')}`,
      `Local:     ${formatTS(ts, tz)}`,
      `Unix (s):  ${ts}`,
      `Unix (ms): ${ts * 1000}`,
      `Relative:  ${getRelative(ts)}`,
    ].join('\n')
    setResult(lines)
  }

  const handleBatch = () => {
    setBatchResults([])
    const lines = batchInput.split('\n').filter(l => l.trim())
    const results: {ts: string, date: string}[] = []
    for (const line of lines) {
      const num = Number(line.trim())
      if (!isNaN(num) && num > 0) {
        const ts = num > 1e12 ? Math.floor(num / 1000) : num
        results.push({ ts: String(ts), date: formatISO(ts, tz) })
      } else {
        const parsed = new Date(line.trim())
        if (!isNaN(parsed.getTime())) {
          results.push({ ts: String(Math.floor(parsed.getTime() / 1000)), date: formatISO(Math.floor(parsed.getTime() / 1000), tz) })
        } else {
          results.push({ ts: 'Error', date: `Cannot parse: ${line.trim()}` })
        }
      }
    }
    setBatchResults(results)
  }

  const getRelative = (ts: number) => {
    const diff = Math.floor(Date.now() / 1000) - ts
    const abs = Math.abs(diff)
    if (abs < 60) return `${abs} seconds ${diff >= 0 ? 'ago' : 'from now'}`
    if (abs < 3600) return `${Math.floor(abs / 60)} minutes ${diff >= 0 ? 'ago' : 'from now'}`
    if (abs < 86400) return `${Math.floor(abs / 3600)} hours ${diff >= 0 ? 'ago' : 'from now'}`
    if (abs < 2592000) return `${Math.floor(abs / 86400)} days ${diff >= 0 ? 'ago' : 'from now'}`
    if (abs < 31536000) return `${Math.floor(abs / 2592000)} months ${diff >= 0 ? 'ago' : 'from now'}`
    return `${Math.floor(abs / 31536000)} years ${diff >= 0 ? 'ago' : 'from now'}`
  }

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const timezones = ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Australia/Sydney', tz].filter((v, i, a) => a.indexOf(v) === i)

  return (
    <ToolLayout tool={tool}>
      {/* Live Clock */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.02em', marginBottom: 8 }}>
          {now}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Current Unix Timestamp (seconds) · {formatISO(now, tz)}
        </div>
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Timezone:</label>
          <select value={tz} onChange={e => setTz(e.target.value)} style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '4px 8px',
            fontSize: 13,
            color: 'var(--text-primary)',
          }}>
            {timezones.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button className="btn btn-sm" onClick={() => copy(String(now))}>
            {copied ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {(['convert', 'batch'] as const).map(m => (
          <button key={m} className={`btn ${mode === m ? 'btn-primary' : ''}`} onClick={() => setMode(m)}>
            {m === 'convert' ? 'Convert' : 'Batch Convert'}
          </button>
        ))}
      </div>

      {mode === 'convert' && (
        <div>
          <div className="options-row">
            <input
              className="input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder='Enter Unix timestamp (1700000000) or date (2024-01-01 12:00:00)'
              onKeyDown={e => e.key === 'Enter' && handleConvert()}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={handleConvert}>Convert</button>
          </div>
          {error && <div style={{ color: 'var(--error)', fontSize: 13, marginTop: 8 }}>{error}</div>}
          {result && (
            <div style={{ marginTop: 16 }}>
              <div className="panel-header">
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Result</span>
                <button className="btn btn-sm" onClick={() => copy(result)}>
                  {copied ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
                </button>
              </div>
              <pre style={{
                padding: 16,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: 13,
                lineHeight: 1.6,
                margin: 0,
              }}>{result}</pre>
            </div>
          )}

          {/* Quick Reference */}
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Quick Reference</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
              {[
                { label: '1 minute', ts: 60 },
                { label: '1 hour', ts: 3600 },
                { label: '1 day', ts: 86400 },
                { label: '1 week', ts: 604800 },
                { label: '1 month', ts: 2592000 },
                { label: '1 year', ts: 31536000 },
              ].map(item => (
                <div key={item.label} style={{
                  padding: '8px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  fontSize: 13,
                }}>
                  <div style={{ fontWeight: 600 }}>{item.label}</div>
                  <div style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{item.ts} seconds</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {mode === 'batch' && (
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
            Enter one timestamp or date per line. Supports Unix timestamps (seconds or milliseconds) and date strings.
          </p>
          <textarea
            className="input"
            value={batchInput}
            onChange={e => setBatchInput(e.target.value)}
            placeholder={"1700000000\n1700003600\n2024-01-01"}
            style={{ minHeight: 150, fontFamily: 'monospace', fontSize: 13 }}
            spellCheck={false}
          />
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-primary" onClick={handleBatch}>Convert All</button>
          </div>
          {batchResults.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div className="panel-header">
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Results ({batchResults.length})</span>
                <button className="btn btn-sm" onClick={() => copy(batchResults.map(r => `${r.ts}\t${r.date}`).join('\n'))}>
                  {copied ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy All</>}
                </button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>Timestamp</th>
                      <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>Date (ISO)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchResults.map((r, i) => (
                      <tr key={i}>
                        <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontFamily: 'monospace' }}>{r.ts}</td>
                        <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontFamily: 'monospace' }}>{r.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  )
}
