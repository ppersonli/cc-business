'use client'
import { useState, useCallback } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'

const tool = getToolBySlug('sitemap-generator')!

interface SitemapEntry {
  url: string
  priority: string
  changefreq: string
  lastmod: string
}

const PRIORITIES = ['1.0', '0.9', '0.8', '0.7', '0.6', '0.5', '0.4', '0.3', '0.2', '0.1']
const FREQS = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']

export default function SitemapGenerator() {
  const [entries, setEntries] = useState<SitemapEntry[]>([
    { url: 'https://example.com/', priority: '1.0', changefreq: 'daily', lastmod: new Date().toISOString().split('T')[0] },
    { url: 'https://example.com/about', priority: '0.8', changefreq: 'monthly', lastmod: new Date().toISOString().split('T')[0] },
    { url: 'https://example.com/blog', priority: '0.9', changefreq: 'daily', lastmod: new Date().toISOString().split('T')[0] },
  ])
  const [bulkInput, setBulkInput] = useState('')
  const [showBulk, setShowBulk] = useState(false)
  const [copied, setCopied] = useState(false)

  const addEntry = () => setEntries([...entries, { url: 'https://example.com/', priority: '0.5', changefreq: 'weekly', lastmod: new Date().toISOString().split('T')[0] }])
  const removeEntry = (i: number) => setEntries(entries.filter((_, idx) => idx !== i))
  const updateEntry = (i: number, field: keyof SitemapEntry, value: string) => {
    const next = [...entries]
    next[i] = { ...next[i], [field]: value }
    setEntries(next)
  }

  const addBulk = () => {
    const urls = bulkInput.split('\n').map(u => u.trim()).filter(u => u.startsWith('http'))
    const newEntries = urls.map(url => ({ url, priority: '0.5', changefreq: 'weekly', lastmod: new Date().toISOString().split('T')[0] }))
    setEntries([...entries, ...newEntries])
    setBulkInput('')
    setShowBulk(false)
  }

  const generate = useCallback(() => {
    const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for (const e of entries) {
      if (!e.url.trim()) continue
      lines.push('  <url>')
      lines.push(`    <loc>${e.url.trim()}</loc>`)
      if (e.lastmod) lines.push(`    <lastmod>${e.lastmod}</lastmod>`)
      lines.push(`    <changefreq>${e.changefreq}</changefreq>`)
      lines.push(`    <priority>${e.priority}</priority>`)
      lines.push('  </url>')
    }
    lines.push('</urlset>')
    return lines.join('\n')
  }, [entries])

  const output = generate()

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const download = () => {
    const blob = new Blob([output], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sitemap.xml'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ToolLayout tool={tool}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', marginBottom: '8px' }}>Sitemap XML Generator</h1>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>
          Generate XML sitemaps for search engines with custom priorities and change frequencies
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button onClick={addEntry} style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>+ Add URL</button>
          <button onClick={() => setShowBulk(!showBulk)} style={{ padding: '8px 16px', backgroundColor: showBulk ? '#10b981' : '#f1f5f9', color: showBulk ? '#fff' : '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>Bulk Import</button>
          <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#64748b', alignSelf: 'center' }}>{entries.length} URLs</span>
        </div>

        {showBulk && (
          <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Paste URLs (one per line):</label>
            <textarea value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} rows={5}
              placeholder="https://example.com/page1&#10;https://example.com/page2&#10;https://example.com/page3"
              style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontFamily: 'monospace', marginTop: '8px', boxSizing: 'border-box', resize: 'vertical' }} />
            <button onClick={addBulk} style={{ marginTop: '8px', padding: '6px 16px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Import URLs</button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Input */}
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {entries.map((entry, i) => (
              <div key={i} style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <input value={entry.url} onChange={(e) => updateEntry(i, 'url', e.target.value)} placeholder="https://..."
                    style={{ flex: 1, padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', fontFamily: 'monospace' }} />
                  {entries.length > 1 && <button onClick={() => removeEntry(i)} style={{ marginLeft: '8px', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select value={entry.priority} onChange={(e) => updateEntry(i, 'priority', e.target.value)}
                    style={{ padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '12px' }}>
                    {PRIORITIES.map(p => <option key={p} value={p}>Priority: {p}</option>)}
                  </select>
                  <select value={entry.changefreq} onChange={(e) => updateEntry(i, 'changefreq', e.target.value)}
                    style={{ padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '12px' }}>
                    {FREQS.map(f => <option key={f} value={f}>Freq: {f}</option>)}
                  </select>
                  <input type="date" value={entry.lastmod} onChange={(e) => updateEntry(i, 'lastmod', e.target.value)}
                    style={{ padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '12px' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Output */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>XML Output</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={copy} style={{ padding: '4px 12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>{copied ? '✓ Copied!' : 'Copy'}</button>
                <button onClick={download} style={{ padding: '4px 12px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Download</button>
              </div>
            </div>
            <pre style={{ padding: '16px', backgroundColor: '#1e293b', color: '#e2e8f0', borderRadius: '12px', fontSize: '12px', fontFamily: 'monospace', lineHeight: 1.5, minHeight: '400px', overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {output}
            </pre>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
