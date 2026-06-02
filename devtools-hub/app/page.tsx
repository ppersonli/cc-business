'use client'
import Link from 'next/link'
import { tools, categories } from '@/lib/tools'
import { iconMap } from '@/components/Icons'

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'DevTools Hub',
    url: 'https://tools.pixiaoli.cn',
    description: '30+ free, client-side developer tools. JSON formatter, regex tester, JavaScript formatter, CSS flexbox generator, and more.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://tools.pixiaoli.cn/?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 16px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }}>
          DevTools Hub
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 18, maxWidth: 560, margin: '0 auto' }}>
          Free online developer tools. 100% client-side, no data sent to servers.
        </p>
      </div>

      {categories.map(cat => (
        <section key={cat} style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 16,
          }}>
            {cat}
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 12,
          }}>
            {tools.filter(t => t.category === cat).map(tool => {
              const Icon = iconMap[tool.slug]
              return (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}/`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '16px 20px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    textDecoration: 'none',
                    color: 'var(--text-primary)',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = tool.color
                    e.currentTarget.style.background = 'var(--bg-tertiary)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.background = 'var(--bg-secondary)'
                  }}
                >
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: `${tool.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: tool.color,
                  }}>
                    {Icon && <Icon />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{tool.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.4 }}>{tool.description}</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
