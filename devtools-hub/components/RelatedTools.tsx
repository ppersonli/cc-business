'use client'
import Link from 'next/link'
import { tools, Tool } from '@/lib/tools'

interface Props {
  currentSlug: string
  category: string
}

export default function RelatedTools({ currentSlug, category }: Props) {
  const related = tools
    .filter(t => t.category === category && t.slug !== currentSlug)
    .slice(0, 4)

  if (related.length === 0) return null

  return (
    <div style={{ marginTop: 32, padding: '16px 0', borderTop: '1px solid var(--border)' }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
        Related Tools
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
        {related.map(tool => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}/`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              textDecoration: 'none',
              color: 'var(--text-primary)',
              fontSize: 13,
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = tool.color}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: `${tool.color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: tool.color,
              fontSize: 12,
              fontWeight: 700,
            }}>
              {tool.name[0]}
            </div>
            <span style={{ fontWeight: 500 }}>{tool.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
