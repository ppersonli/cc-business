'use client'
import { useState, useMemo } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'

const tool = getToolBySlug('meta-tag-generator')!

interface MetaData {
  title: string
  description: string
  author: string
  keywords: string
  siteUrl: string
  ogImage: string
  twitterHandle: string
  robots: string
}

export default function MetaTagGenerator() {
  const [meta, setMeta] = useState<MetaData>({
    title: '',
    description: '',
    author: '',
    keywords: '',
    siteUrl: '',
    ogImage: '',
    twitterHandle: '',
    robots: 'index, follow',
  })
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'og' | 'twitter'>('basic')

  const update = (key: keyof MetaData, value: string) => setMeta((prev) => ({ ...prev, [key]: value }))

  const html = useMemo(() => {
    const lines: string[] = ['<!-- Basic Meta Tags -->']
    lines.push('<meta charset="UTF-8">')
    lines.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">')
    if (meta.title) lines.push(`<title>${meta.title}</title>`)
    if (meta.description) lines.push(`<meta name="description" content="${meta.description}">`)
    if (meta.author) lines.push(`<meta name="author" content="${meta.author}">`)
    if (meta.keywords) lines.push(`<meta name="keywords" content="${meta.keywords}">`)
    if (meta.robots) lines.push(`<meta name="robots" content="${meta.robots}">`)

    if (meta.siteUrl || meta.ogImage || meta.title) {
      lines.push('')
      lines.push('<!-- Open Graph / Facebook -->')
      lines.push('<meta property="og:type" content="website">')
      if (meta.siteUrl) lines.push(`<meta property="og:url" content="${meta.siteUrl}">`)
      if (meta.title) lines.push(`<meta property="og:title" content="${meta.title}">`)
      if (meta.description) lines.push(`<meta property="og:description" content="${meta.description}">`)
      if (meta.ogImage) lines.push(`<meta property="og:image" content="${meta.ogImage}">`)
    }

    if (meta.twitterHandle || meta.title) {
      lines.push('')
      lines.push('<!-- Twitter -->')
      lines.push('<meta property="twitter:card" content="summary_large_image">')
      if (meta.siteUrl) lines.push(`<meta property="twitter:url" content="${meta.siteUrl}">`)
      if (meta.title) lines.push(`<meta property="twitter:title" content="${meta.title}">`)
      if (meta.description) lines.push(`<meta property="twitter:description" content="${meta.description}">`)
      if (meta.ogImage) lines.push(`<meta property="twitter:image" content="${meta.ogImage}">`)
      if (meta.twitterHandle) lines.push(`<meta name="twitter:creator" content="@${meta.twitterHandle.replace('@', '')}">`)
    }

    return lines.join('\n')
  }, [meta])

  const copyHtml = () => {
    navigator.clipboard.writeText(html)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const charCount = meta.description.length

  return (
    <ToolLayout tool={tool}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', marginBottom: '24px' }}>
          Meta Tag Generator
        </h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', padding: '0 8px' }}>
          {(['basic', 'og', 'twitter'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: '10px 20px', border: 'none', borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
                background: 'none', fontSize: '14px', fontWeight: 600, color: activeTab === tab ? '#3b82f6' : '#64748b', cursor: 'pointer' }}>
              {tab === 'basic' ? 'Basic' : tab === 'og' ? 'Open Graph' : 'Twitter'}
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {activeTab === 'basic' && (
            <>
              <InputField label="Title" value={meta.title} onChange={(v) => update('title', v)} placeholder="My Awesome Website" maxLength={60} />
              <div>
                <InputField label="Description" value={meta.description} onChange={(v) => update('description', v)} placeholder="A brief description of your website..." maxLength={160} textarea />
                <div style={{ fontSize: '12px', color: charCount > 160 ? '#ef4444' : '#94a3b8', marginTop: '4px', textAlign: 'right' }}>
                  {charCount}/160 characters
                </div>
              </div>
              <InputField label="Author" value={meta.author} onChange={(v) => update('author', v)} placeholder="Your Name" />
              <InputField label="Keywords" value={meta.keywords} onChange={(v) => update('keywords', v)} placeholder="keyword1, keyword2, keyword3" />
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#64748b' }}>Robots</label>
                <select value={meta.robots} onChange={(e) => update('robots', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', backgroundColor: '#fff' }}>
                  <option value="index, follow">index, follow</option>
                  <option value="noindex, follow">noindex, follow</option>
                  <option value="index, nofollow">index, nofollow</option>
                  <option value="noindex, nofollow">noindex, nofollow</option>
                </select>
              </div>
            </>
          )}
          {activeTab === 'og' && (
            <>
              <InputField label="Site URL" value={meta.siteUrl} onChange={(v) => update('siteUrl', v)} placeholder="https://example.com" />
              <InputField label="OG Image URL" value={meta.ogImage} onChange={(v) => update('ogImage', v)} placeholder="https://example.com/og-image.png" />
              {meta.ogImage && (
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={meta.ogImage} alt="OG Preview" style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
              )}
            </>
          )}
          {activeTab === 'twitter' && (
            <>
              <InputField label="Twitter Handle" value={meta.twitterHandle} onChange={(v) => update('twitterHandle', v)} placeholder="@username" />
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>Preview</div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  {meta.ogImage && <img src={meta.ogImage} alt="" style={{ width: '100%', height: '140px', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />}
                  <div style={{ padding: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{meta.siteUrl || 'example.com'}</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginTop: '4px' }}>{meta.title || 'Your Title'}</div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{meta.description || 'Your description...'}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Output */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Generated HTML</span>
            <button onClick={copyHtml} style={{ padding: '6px 16px', backgroundColor: '#3b82f6', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <pre style={{ padding: '16px', margin: 0, fontSize: '13px', lineHeight: 1.6, overflowX: 'auto', fontFamily: 'monospace', color: '#334155', backgroundColor: '#fff' }}>
            {html}
          </pre>
        </div>
      </div>
    </ToolLayout>
  )
}

function InputField({ label, value, onChange, placeholder, maxLength, textarea }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; maxLength?: number; textarea?: boolean
}) {
  const style = { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical' as const }
  return (
    <div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#64748b' }}>{label}</label>
      {textarea
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} style={style} />
        : <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} style={style} />
      }
    </div>
  )
}
