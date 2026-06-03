'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { tools, categories } from '@/lib/tools'
import { iconMap } from '@/components/Icons'

export default function Home() {
  const t = useTranslations()
  const locale = useLocale()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'DevTools Hub',
    url: `https://tools.pixiaoli.cn/${locale}/`,
    description: t('common.subtitle'),
    potentialAction: {
      '@type': 'SearchAction',
      target: `https://tools.pixiaoli.cn/${locale}/?q={search_term_string}`,
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
        <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          {t('common.appName')}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 18, maxWidth: 560, margin: '0 auto' }}>
          {t('home.subtitle')}
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
            {t(`categories.${cat}`)}
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
                  href={`/${locale}/tools/${tool.slug}/`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '16px 20px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    color: 'var(--text-primary)',
                    transition: 'all 0.2s ease',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--accent)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-sm)',
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
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{t(`tools.${tool.slug}.name`)}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.4 }}>{t(`tools.${tool.slug}.description`)}</div>
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
