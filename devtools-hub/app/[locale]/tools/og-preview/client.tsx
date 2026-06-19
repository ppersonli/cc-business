'use client'
import { useState } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'

const tool = getToolBySlug('og-preview')!

interface OgData {
  title: string
  description: string
  image: string
  url: string
  siteName: string
  type: string
}

export default function OgPreview() {
  const [data, setData] = useState<OgData>({
    title: 'Build Better Web Apps with DevTools Hub',
    description: 'Free online developer tools. JSON formatter, CSS generators, SEO analyzers, and 50+ more tools — all client-side, no data sent to servers.',
    image: 'https://devtools-hub.com/og-image.png',
    url: 'https://devtools-hub.com',
    siteName: 'DevTools Hub',
    type: 'website',
  })
  const [copied, setCopied] = useState('')

  const update = (field: keyof OgData, value: string) => setData({ ...data, [field]: value })

  const generateTags = () => {
    return `<!-- Open Graph / Facebook -->
<meta property="og:type" content="${data.type}" />
<meta property="og:url" content="${data.url}" />
<meta property="og:title" content="${data.title}" />
<meta property="og:description" content="${data.description}" />
<meta property="og:image" content="${data.image}" />
<meta property="og:site_name" content="${data.siteName}" />

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content="${data.url}" />
<meta property="twitter:title" content="${data.title}" />
<meta property="twitter:description" content="${data.description}" />
<meta property="twitter:image" content="${data.image}" />`
  }

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(''), 2000)
  }

  const truncDesc = (s: string, max: number) => s.length > max ? s.slice(0, max) + '...' : s

  return (
    <ToolLayout tool={tool}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', marginBottom: '8px' }}>Open Graph Preview</h1>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>
          Preview how your links appear on social media and generate OG meta tags
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Input */}
          <div>
            {([
              { key: 'title' as const, label: 'Title', placeholder: 'Page title' },
              { key: 'description' as const, label: 'Description', placeholder: 'Page description' },
              { key: 'url' as const, label: 'URL', placeholder: 'https://...' },
              { key: 'image' as const, label: 'Image URL', placeholder: 'https://...image.png' },
              { key: 'siteName' as const, label: 'Site Name', placeholder: 'My Website' },
            ]).map(field => (
              <div key={field.key} style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>{field.label}</label>
                {field.key === 'description' ? (
                  <textarea value={data[field.key]} onChange={(e) => update(field.key, e.target.value)} rows={3} placeholder={field.placeholder}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical' }} />
                ) : (
                  <input value={data[field.key]} onChange={(e) => update(field.key, e.target.value)} placeholder={field.placeholder}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }} />
                )}
                {field.key === 'title' && <span style={{ fontSize: '11px', color: data.title.length > 60 ? '#ef4444' : '#94a3b8' }}>{data.title.length}/60</span>}
                {field.key === 'description' && <span style={{ fontSize: '11px', color: data.description.length > 160 ? '#ef4444' : '#94a3b8' }}>{data.description.length}/160</span>}
              </div>
            ))}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Type</label>
              <select value={data.type} onChange={(e) => update('type', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px' }}>
                {['website', 'article', 'profile', 'video', 'music'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Previews */}
          <div>
            {/* Facebook */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>Facebook / LinkedIn</div>
              <div style={{ border: '1px solid #dadde1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff' }}>
                {data.image && (
                  <div style={{ width: '100%', height: '200px', backgroundColor: '#f0f2f5', backgroundImage: `url(${data.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                )}
                <div style={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: '12px', color: '#65676b', textTransform: 'uppercase' }}>{data.url ? new URL(data.url).hostname : 'example.com'}</div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#050505', marginTop: '4px', lineHeight: 1.2 }}>{data.title || 'Title'}</div>
                  <div style={{ fontSize: '14px', color: '#65676b', marginTop: '4px', lineHeight: 1.4 }}>{truncDesc(data.description || 'Description', 120)}</div>
                </div>
              </div>
            </div>

            {/* Twitter */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>Twitter / X</div>
              <div style={{ border: '1px solid #e1e8ed', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#fff' }}>
                {data.image && (
                  <div style={{ width: '100%', height: '180px', backgroundColor: '#f0f2f5', backgroundImage: `url(${data.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                )}
                <div style={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f1419', lineHeight: 1.2 }}>{data.title || 'Title'}</div>
                  <div style={{ fontSize: '14px', color: '#536471', marginTop: '4px', lineHeight: 1.4 }}>{truncDesc(data.description || 'Description', 120)}</div>
                  <div style={{ fontSize: '13px', color: '#536471', marginTop: '4px' }}>{data.url ? new URL(data.url).hostname : 'example.com'}</div>
                </div>
              </div>
            </div>

            {/* Slack */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>Slack</div>
              <div style={{ borderLeft: '4px solid #36c5f0', padding: '8px 12px', backgroundColor: '#f8f9fa' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1d1c1d' }}>{data.siteName || 'Site Name'}</div>
                <div style={{ fontSize: '14px', color: '#1264a3', marginTop: '2px', textDecoration: 'underline' }}>{data.title || 'Title'}</div>
                <div style={{ fontSize: '13px', color: '#616061', marginTop: '4px' }}>{truncDesc(data.description || 'Description', 200)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Tags */}
        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Generated Meta Tags</span>
            <button onClick={() => copy(generateTags(), 'tags')}
              style={{ padding: '6px 16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
              {copied === 'tags' ? '✓ Copied!' : 'Copy Tags'}
            </button>
          </div>
          <pre style={{ padding: '16px', backgroundColor: '#1e293b', color: '#e2e8f0', borderRadius: '12px', fontSize: '12px', fontFamily: 'monospace', lineHeight: 1.6, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
            {generateTags()}
          </pre>
        </div>
      </div>
    </ToolLayout>
  )
}
