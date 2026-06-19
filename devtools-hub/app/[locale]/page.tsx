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
    url: `https://tools.ovanime.com/${locale}/`,
    description: t('common.subtitle'),
    potentialAction: {
      '@type': 'SearchAction',
      target: `https://tools.ovanime.com/${locale}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 16px' }} className="home-container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div style={{ textAlign: 'center', marginBottom: 48 }} className="hero-section">
        <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em', color: 'var(--text-primary)' }} className="hero-title">
          {t('common.appName')}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 18, maxWidth: 560, margin: '0 auto' }}>
          {t('home.subtitle')}
        </p>
      </div>

      {/* Featured: WeChat Markdown Editor */}
      <Link
        href={`/${locale}/tools/wechat-markdown-editor/`}
        className="featured-card"
        style={{
          display: 'block',
          textDecoration: 'none',
          marginBottom: 48,
          borderRadius: 'var(--radius-lg, 16px)',
          background: 'linear-gradient(135deg, #07C16010 0%, #07C16008 50%, transparent 100%)',
          border: '1px solid #07C16030',
          padding: '32px 36px',
          transition: 'all 0.25s ease',
          boxShadow: 'var(--shadow-sm)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = '#07C160'
          e.currentTarget.style.boxShadow = '0 8px 30px #07C16018'
          e.currentTarget.style.transform = 'translateY(-3px)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = '#07C16030'
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-sm)',
            background: '#07C16018',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#07C160',
            flexShrink: 0,
          }}>
            {iconMap['wechat-markdown-editor'] && (() => { const Icon = iconMap['wechat-markdown-editor']; return <Icon /> })()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--text-primary)' }}>
              {t('tools.wechat-markdown-editor.name')}
            </div>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#07C160',
              background: '#07C16015',
              padding: '2px 8px',
              borderRadius: 4,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              ★ {locale === 'zh' ? '精选工具' : locale === 'de' ? 'Empfohlen' : 'Featured'}
            </span>
          </div>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
          {t('tools.wechat-markdown-editor.about')}
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          {(locale === 'zh'
            ? ['10+ 主题', '一键复制到微信', '实时预览', 'KaTeX 公式', 'Mermaid 图表']
            : locale === 'de'
            ? ['10+ Themes', 'Ein-Klick-Kopie', 'Live-Vorschau', 'KaTeX-Formeln', 'Mermaid-Diagramme']
            : ['10+ Themes', 'One-click Copy', 'Live Preview', 'KaTeX Math', 'Mermaid Diagrams']
          ).map(tag => (
            <span key={tag} style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              padding: '4px 10px',
              borderRadius: 6,
            }}>
              {tag}
            </span>
          ))}
        </div>
      </Link>

      {/* Featured: ovanime.com */}
      <a
        href="https://ovanime.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block',
          textDecoration: 'none',
          marginBottom: 48,
          borderRadius: 'var(--radius-lg, 16px)',
          background: 'linear-gradient(135deg, #7c3aed10 0%, #7c3aed08 50%, transparent 100%)',
          border: '1px solid #7c3aed30',
          padding: '32px 36px',
          transition: 'all 0.25s ease',
          boxShadow: 'var(--shadow-sm)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = '#7c3aed'
          e.currentTarget.style.boxShadow = '0 8px 30px #7c3aed18'
          e.currentTarget.style.transform = 'translateY(-3px)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = '#7c3aed30'
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-sm)',
            background: '#7c3aed18',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
          }}>
            <img src="/ovanime-icon.jpg" alt="ovanime.com" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--text-primary)' }}>
              {t('home.ovanimeName')}
            </div>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#7c3aed',
              background: '#7c3aed15',
              padding: '2px 8px',
              borderRadius: 4,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              ★ {locale === 'zh' ? '精选' : locale === 'de' ? 'Empfohlen' : 'Featured'}
            </span>
          </div>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
          {t('home.ovanimeDesc')}
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          {(t.raw('home.ovanimeTags') || ['AI Manga', 'Webtoon', 'ACGN', 'Creative Platform']).map((tag: string) => (
            <span key={tag} style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              padding: '4px 10px',
              borderRadius: 6,
            }}>
              {tag}
            </span>
          ))}
        </div>
      </a>

      {/* Featured: SocialForge */}
      <a
        href="https://github.com/socialforge/socialforge"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block',
          textDecoration: 'none',
          marginBottom: 48,
          borderRadius: 'var(--radius-lg, 16px)',
          background: 'linear-gradient(135deg, #7c3aed10 0%, #7c3aed08 50%, transparent 100%)',
          border: '1px solid #7c3aed30',
          padding: '32px 36px',
          transition: 'all 0.25s ease',
          boxShadow: 'var(--shadow-sm)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = '#7c3aed'
          e.currentTarget.style.boxShadow = '0 8px 30px #7c3aed18'
          e.currentTarget.style.transform = 'translateY(-3px)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = '#7c3aed30'
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-sm)',
            background: '#7c3aed18',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#7c3aed',
            flexShrink: 0,
          }}>
            {iconMap['socialforge'] && (() => { const Icon = iconMap['socialforge']; return <Icon /> })()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--text-primary)' }}>
              {t('home.socialforgeName')}
            </div>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#7c3aed',
              background: '#7c3aed15',
              padding: '2px 8px',
              borderRadius: 4,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              ★ {locale === 'zh' ? '开源' : locale === 'de' ? 'Open Source' : locale === 'ja' ? 'オープンソース' : locale === 'ko' ? '오픈 소스' : locale === 'pt' ? 'Código Aberto' : locale === 'es' ? 'Código Abierto' : 'Open Source'}
            </span>
          </div>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
          {t('home.socialforgeDesc')}
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          {(t.raw('home.socialforgeTags') || ['Social Media', 'Scheduling', 'Analytics', 'Open Source']).map((tag: string) => (
            <span key={tag} style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              padding: '4px 10px',
              borderRadius: 6,
            }}>
              {tag}
            </span>
          ))}
        </div>
      </a>

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
          <div className="tools-grid" style={{
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

      <style jsx global>{`
        @media (max-width: 640px) {
          .home-container { padding: 24px 12px !important; }
          .hero-title { font-size: 32px !important; }
          .hero-section { margin-bottom: 28px !important; }
          .featured-card { padding: 20px 16px !important; margin-bottom: 28px !important; }
          .featured-card [style*="fontSize: 20"] { font-size: 17px !important; }
          .featured-card [style*="fontSize: 15"] { font-size: 14px !important; }
          .tools-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
