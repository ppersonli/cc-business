import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

type Props = { params: Promise<{ locale: string }> };

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('landing');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero */}
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, maxWidth: '640px', marginBottom: '20px' }}>
          {t('hero')}
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--text-muted)', maxWidth: '480px', lineHeight: 1.6, marginBottom: '32px' }}>
          {t('subtitle')}
        </p>
        <Link href="/auth/signin" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '16px', textDecoration: 'none' }}>
          {t('cta')}
        </Link>
      </section>

      {/* Features */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', padding: '60px 24px', maxWidth: '960px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {[
          { title: t('feature1Title'), desc: t('feature1Desc'), icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
          { title: t('feature2Title'), desc: t('feature2Desc'), icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
          { title: t('feature3Title'), desc: t('feature3Desc'), icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
        ].map((f) => (
          <div key={f.title} className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px' }}>
              <path d={f.icon} />
            </svg>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>{f.title}</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer style={{ padding: '24px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Vertical Scheduler — Built for your industry
        </p>
      </footer>
    </div>
  );
}
