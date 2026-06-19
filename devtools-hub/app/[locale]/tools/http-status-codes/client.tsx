'use client'
import { useState, useMemo } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'

const tool = getToolBySlug('http-status-codes')!

interface StatusCode { code: number; name: string; desc: string }

const STATUS_CODES: { category: string; color: string; codes: StatusCode[] }[] = [
  {
    category: '1xx Informational', color: '#0ea5e9',
    codes: [
      { code: 100, name: 'Continue', desc: 'Server received headers, client should continue sending body' },
      { code: 101, name: 'Switching Protocols', desc: 'Server is switching to a different protocol as requested' },
      { code: 102, name: 'Processing', desc: 'Server has received and is processing the request (WebDAV)' },
      { code: 103, name: 'Early Hints', desc: 'Response headers sent while server prepares final response' },
    ]
  },
  {
    category: '2xx Success', color: '#16a34a',
    codes: [
      { code: 200, name: 'OK', desc: 'Request succeeded, response contains requested data' },
      { code: 201, name: 'Created', desc: 'Request succeeded and a new resource was created' },
      { code: 202, name: 'Accepted', desc: 'Request accepted for processing, not yet completed' },
      { code: 203, name: 'Non-Authoritative Info', desc: 'Response modified by a transforming proxy' },
      { code: 204, name: 'No Content', desc: 'Request succeeded but no content to return' },
      { code: 205, name: 'Reset Content', desc: 'Request succeeded, client should reset the form view' },
      { code: 206, name: 'Partial Content', desc: 'Server is delivering only part of the resource (Range request)' },
    ]
  },
  {
    category: '3xx Redirection', color: '#e6a23c',
    codes: [
      { code: 301, name: 'Moved Permanently', desc: 'Resource permanently moved to new URL (SEO: passes link juice)' },
      { code: 302, name: 'Found (Temporary)', desc: 'Resource temporarily at different URL (SEO: does not pass link juice)' },
      { code: 303, name: 'See Other', desc: 'Response can be found at another URI with GET method' },
      { code: 304, name: 'Not Modified', desc: 'Resource not modified since last request (use cached version)' },
      { code: 307, name: 'Temporary Redirect', desc: 'Same as 302 but method and body must not change' },
      { code: 308, name: 'Permanent Redirect', desc: 'Same as 301 but method and body must not change' },
    ]
  },
  {
    category: '4xx Client Error', color: '#ef4444',
    codes: [
      { code: 400, name: 'Bad Request', desc: 'Server cannot understand the request due to malformed syntax' },
      { code: 401, name: 'Unauthorized', desc: 'Authentication is required and has failed or not been provided' },
      { code: 403, name: 'Forbidden', desc: 'Server understood request but refuses to authorize it' },
      { code: 404, name: 'Not Found', desc: 'Requested resource could not be found on the server' },
      { code: 405, name: 'Method Not Allowed', desc: 'HTTP method is not supported for the requested resource' },
      { code: 406, name: 'Not Acceptable', desc: 'Server cannot produce response matching Accept headers' },
      { code: 408, name: 'Request Timeout', desc: 'Server timed out waiting for the client request' },
      { code: 409, name: 'Conflict', desc: 'Request conflicts with current state of the server' },
      { code: 410, name: 'Gone', desc: 'Resource has been permanently deleted and will not return (SEO: faster de-indexing)' },
      { code: 413, name: 'Payload Too Large', desc: 'Request body is larger than server is willing to process' },
      { code: 414, name: 'URI Too Long', desc: 'Request URI is longer than the server is willing to interpret' },
      { code: 415, name: 'Unsupported Media Type', desc: 'Request data format is not supported by the server' },
      { code: 422, name: 'Unprocessable Entity', desc: 'Request was well-formed but contains semantic errors' },
      { code: 429, name: 'Too Many Requests', desc: 'Rate limit exceeded, retry after Retry-After header time' },
    ]
  },
  {
    category: '5xx Server Error', color: '#9333ea',
    codes: [
      { code: 500, name: 'Internal Server Error', desc: 'Unexpected error occurred on the server' },
      { code: 501, name: 'Not Implemented', desc: 'Server does not support the functionality required' },
      { code: 502, name: 'Bad Gateway', desc: 'Server acting as gateway received invalid response from upstream' },
      { code: 503, name: 'Service Unavailable', desc: 'Server temporarily unavailable (overload or maintenance)' },
      { code: 504, name: 'Gateway Timeout', desc: 'Server acting as gateway did not receive timely upstream response' },
      { code: 520, name: 'Unknown Error (CF)', desc: 'Cloudflare-specific: origin server returned an unknown error' },
      { code: 521, name: 'Web Server Down (CF)', desc: 'Cloudflare-specific: origin server refused connection' },
      { code: 522, name: 'Connection Timed Out (CF)', desc: 'Cloudflare-specific: origin server connection timed out' },
    ]
  },
]

export default function HttpStatusCodes() {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set(STATUS_CODES.map(c => c.category)))

  const filtered = useMemo(() => {
    if (!search.trim()) return STATUS_CODES
    const q = search.trim().toLowerCase()
    return STATUS_CODES.map(cat => ({
      ...cat,
      codes: cat.codes.filter(c =>
        String(c.code).includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q)
      )
    })).filter(cat => cat.codes.length > 0)
  }, [search])

  const toggle = (cat: string) => {
    const next = new Set(expanded)
    next.has(cat) ? next.delete(cat) : next.add(cat)
    setExpanded(next)
  }

  return (
    <ToolLayout tool={tool}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', marginBottom: '8px' }}>
          HTTP Status Codes Reference
        </h1>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>
          Quick reference for all HTTP status codes with SEO notes
        </p>

        {/* Search */}
        <div style={{ marginBottom: '24px' }}>
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code, name, or description..."
            style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#f8fafc' }}
          />
        </div>

        {/* Categories */}
        {filtered.map(cat => (
          <div key={cat.category} style={{ marginBottom: '16px' }}>
            <button
              onClick={() => toggle(cat.category)}
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: cat.color + '12', border: `1px solid ${cat.color}30`, borderRadius: expanded.has(cat.category) ? '10px 10px 0 0' : '10px', cursor: 'pointer', fontSize: '15px', fontWeight: 600, color: cat.color }}>
              <span>{cat.category}</span>
              <span style={{ fontSize: '12px', opacity: 0.7 }}>{expanded.has(cat.category) ? '▼' : '▶'}</span>
            </button>
            {expanded.has(cat.category) && (
              <div style={{ border: `1px solid ${cat.color}20`, borderTop: 'none', borderRadius: '0 0 10px 10px', overflow: 'hidden' }}>
                {cat.codes.map(c => (
                  <div key={c.code} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 700, color: cat.color, minWidth: '42px' }}>{c.code}</span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>{c.name}</div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>{c.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
            No status codes found matching "{search}"
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
