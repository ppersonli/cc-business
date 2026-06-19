'use client'
import { useState, useCallback } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'

const tool = getToolBySlug('robots-txt')!

interface Rule {
  userAgent: string
  allow: string[]
  disallow: string[]
  crawlDelay?: string
}

const PRESETS = [
  {
    name: 'Allow All',
    rules: [{ userAgent: '*', allow: ['/'], disallow: [] }],
    sitemap: 'https://example.com/sitemap.xml',
  },
  {
    name: 'Block All',
    rules: [{ userAgent: '*', allow: [], disallow: ['/'] }],
    sitemap: '',
  },
  {
    name: 'SEO Friendly',
    rules: [
      { userAgent: '*', allow: ['/'], disallow: ['/admin/', '/api/', '/private/', '/search?'] },
      { userAgent: 'Googlebot', allow: ['/'], disallow: ['/api/'] },
    ],
    sitemap: 'https://example.com/sitemap.xml',
  },
  {
    name: 'WordPress',
    rules: [
      { userAgent: '*', allow: ['/wp-content/uploads/'], disallow: ['/wp-admin/', '/wp-includes/', '/wp-content/plugins/'] },
    ],
    sitemap: 'https://example.com/sitemap_index.xml',
  },
]

export default function RobotsTxtGenerator() {
  const [rules, setRules] = useState<Rule[]>([{ userAgent: '*', allow: ['/'], disallow: [] }])
  const [sitemap, setSitemap] = useState('https://example.com/sitemap.xml')
  const [copied, setCopied] = useState(false)

  const addRule = () => setRules([...rules, { userAgent: '*', allow: [], disallow: [] }])
  const removeRule = (i: number) => setRules(rules.filter((_, idx) => idx !== i))
  const updateRule = (i: number, field: keyof Rule, value: string | string[]) => {
    const next = [...rules]
    next[i] = { ...next[i], [field]: value }
    setRules(next)
  }
  const addPath = (ruleIdx: number, field: 'allow' | 'disallow') => {
    const next = [...rules]
    next[ruleIdx] = { ...next[ruleIdx], [field]: [...next[ruleIdx][field], ''] }
    setRules(next)
  }
  const updatePath = (ruleIdx: number, field: 'allow' | 'disallow', pathIdx: number, value: string) => {
    const next = [...rules]
    const paths = [...next[ruleIdx][field]]
    paths[pathIdx] = value
    next[ruleIdx] = { ...next[ruleIdx], [field]: paths }
    setRules(next)
  }
  const removePath = (ruleIdx: number, field: 'allow' | 'disallow', pathIdx: number) => {
    const next = [...rules]
    next[ruleIdx] = { ...next[ruleIdx], [field]: next[ruleIdx][field].filter((_, idx) => idx !== pathIdx) }
    setRules(next)
  }

  const applyPreset = (preset: typeof PRESETS[number]) => {
    setRules(preset.rules.map(r => ({ ...r, crawlDelay: undefined })))
    setSitemap(preset.sitemap)
  }

  const generate = useCallback(() => {
    const lines: string[] = []
    for (const rule of rules) {
      lines.push(`User-agent: ${rule.userAgent}`)
      for (const a of rule.allow) if (a.trim()) lines.push(`Allow: ${a.trim()}`)
      for (const d of rule.disallow) if (d.trim()) lines.push(`Disallow: ${d.trim()}`)
      if (rule.crawlDelay) lines.push(`Crawl-delay: ${rule.crawlDelay}`)
      lines.push('')
    }
    if (sitemap.trim()) lines.push(`Sitemap: ${sitemap.trim()}`)
    return lines.join('\n')
  }, [rules, sitemap])

  const output = generate()

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const download = () => {
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'robots.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ToolLayout tool={tool}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', marginBottom: '8px' }}>
          Robots.txt Generator
        </h1>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>
          Generate robots.txt files to control search engine crawler behavior
        </p>

        {/* Presets */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
          {PRESETS.map(p => (
            <button key={p.name} onClick={() => applyPreset(p)}
              style={{ padding: '6px 14px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
              {p.name}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Input Panel */}
          <div>
            {/* Rules */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '15px', fontWeight: 600 }}>Rules</span>
              <button onClick={addRule} style={{ padding: '4px 12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                + Add Rule
              </button>
            </div>

            {rules.map((rule, ri) => (
              <div key={ri} style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>User-agent:</label>
                    <input value={rule.userAgent} onChange={(e) => updateRule(ri, 'userAgent', e.target.value)}
                      style={{ padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '13px', fontFamily: 'monospace', width: '100px' }} />
                  </div>
                  {rules.length > 1 && (
                    <button onClick={() => removeRule(ri)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                  )}
                </div>

                {(['allow', 'disallow'] as const).map(field => (
                  <div key={field} style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: field === 'allow' ? '#16a34a' : '#dc2626', textTransform: 'uppercase' }}>{field}</span>
                      <button onClick={() => addPath(ri, field)} style={{ fontSize: '12px', color: '#3b82f6', border: 'none', background: 'none', cursor: 'pointer' }}>+ path</button>
                    </div>
                    {rule[field].map((path, pi) => (
                      <div key={pi} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                        <input value={path} onChange={(e) => updatePath(ri, field, pi, e.target.value)} placeholder={field === 'allow' ? '/path/' : '/path/'}
                          style={{ flex: 1, padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '13px', fontFamily: 'monospace' }} />
                        <button onClick={() => removePath(ri, field, pi)} style={{ color: '#94a3b8', border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                      </div>
                    ))}
                  </div>
                ))}

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Crawl-delay:</label>
                  <input value={rule.crawlDelay || ''} onChange={(e) => updateRule(ri, 'crawlDelay', e.target.value)} placeholder="seconds (optional)"
                    style={{ padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '13px', fontFamily: 'monospace', width: '120px' }} />
                </div>
              </div>
            ))}

            {/* Sitemap */}
            <div style={{ marginTop: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Sitemap URL:</label>
              <input value={sitemap} onChange={(e) => setSitemap(e.target.value)} placeholder="https://example.com/sitemap.xml"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', fontFamily: 'monospace', marginTop: '4px', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Output Panel */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '15px', fontWeight: 600 }}>Output</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={copy} style={{ padding: '4px 12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
                <button onClick={download} style={{ padding: '4px 12px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                  Download
                </button>
              </div>
            </div>
            <pre style={{
              padding: '16px', backgroundColor: '#1e293b', color: '#e2e8f0', borderRadius: '12px', fontSize: '13px', fontFamily: 'monospace',
              lineHeight: 1.6, minHeight: '400px', overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word'
            }}>
              {output}
            </pre>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
