'use client'
import { useState, useCallback } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'

const tool = getToolBySlug('ip-lookup')!

interface IpInfo {
  query: string
  country: string
  regionName: string
  city: string
  zip: string
  lat: number
  lon: number
  timezone: string
  isp: string
  org: string
  as: string
}

export default function IpLookup() {
  const [ipInput, setIpInput] = useState('')
  const [result, setResult] = useState<IpInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lookup = useCallback(async (ip?: string) => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const target = ip || ipInput.trim() || ''
      const url = target
        ? `https://ip-api.com/json/${target}?fields=66846719`
        : `https://ip-api.com/json/?fields=66846719`
      const res = await fetch(url)
      if (!res.ok) throw new Error('API request failed')
      const data = await res.json()
      if (data.status === 'fail') {
        setError(data.message || 'Lookup failed')
      } else {
        setResult(data)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [ipInput])

  const getMyIp = useCallback(() => {
    setIpInput('')
    lookup()
  }, [lookup])

  return (
    <ToolLayout tool={tool}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          value={ipInput}
          onChange={(e) => setIpInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && lookup()}
          placeholder="Enter IP address (e.g. 8.8.8.8) or leave empty for your IP"
          style={{
            flex: 1,
            padding: '10px 14px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
          }}
        />
        <button className="btn btn-primary" onClick={() => lookup()} disabled={loading}>
          {loading ? 'Looking up...' : 'Lookup'}
        </button>
        <button className="btn" onClick={getMyIp} disabled={loading}>
          My IP
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
          {([
            ['IP Address', result.query],
            ['Country', result.country],
            ['Region', result.regionName],
            ['City', result.city],
            ['ZIP', result.zip],
            ['Latitude', result.lat?.toFixed(4)],
            ['Longitude', result.lon?.toFixed(4)],
            ['Timezone', result.timezone],
            ['ISP', result.isp],
            ['Organization', result.org],
            ['AS', result.as],
          ] as [string, string | number | undefined][]).map(([label, value]) => (
            <div key={label} style={{
              padding: '12px 16px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 8,
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
                {value || '—'}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        Powered by <a href="https://ip-api.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>ip-api.com</a> free API. 45 requests per minute limit. Geolocation data is approximate.
      </div>
    </ToolLayout>
  )
}
