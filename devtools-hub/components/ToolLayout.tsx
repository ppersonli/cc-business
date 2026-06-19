import Link from 'next/link'
import { getToolBySlug, Tool } from '@/lib/tools'
import RelatedTools from './RelatedTools'

interface Props {
  tool: Tool
  children: React.ReactNode
}

export default function ToolLayout({ tool, children }: Props) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    description: tool.description,
    url: `https://tools.ovanime.com/tools/${tool.slug}/`,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }

  return (
    <div className="tool-container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav style={{ marginBottom: 24, fontSize: 14 }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
          Tools
        </Link>
        <span style={{ color: 'var(--text-muted)', margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--text-secondary)' }}>{tool.name}</span>
      </nav>

      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: `${tool.color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ color: tool.color, fontSize: 20 }}>{tool.name[0]}</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>{tool.name}</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>{tool.description}</p>
      </div>

      {children}

      <RelatedTools currentSlug={tool.slug} category={tool.category} />

      <div style={{
        marginTop: 24,
        padding: '16px 0',
        borderTop: '1px solid var(--border)',
        textAlign: 'center',
      }}>
        <Link href="/" className="btn" style={{ textDecoration: 'none' }}>
          ← Back to all tools
        </Link>
      </div>
    </div>
  )
}
