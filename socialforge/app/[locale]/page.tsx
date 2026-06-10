import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Calendar, Sparkles, BarChart3, Image, Shield, Zap, Check } from 'lucide-react';

type Props = { params: Promise<{ locale: string }> };

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('landing');
  const tp = await getTranslations('pricing');

  const features = [
    { title: t('feature1Title'), desc: t('feature1Desc'), icon: Zap, color: '#7c3aed' },
    { title: t('feature2Title'), desc: t('feature2Desc'), icon: Calendar, color: '#3b82f6' },
    { title: t('feature3Title'), desc: t('feature3Desc'), icon: Sparkles, color: '#f59e0b' },
    { title: t('feature4Title'), desc: t('feature4Desc'), icon: BarChart3, color: '#22c55e' },
    { title: t('feature5Title'), desc: t('feature5Desc'), icon: Image, color: '#ec4899' },
    { title: t('feature6Title'), desc: t('feature6Desc'), icon: Shield, color: '#06b6d4' },
  ];

  const plans = [
    { name: tp('free'), price: tp('freePrice'), features: tp('freeFeatures').split(', '), color: 'var(--border)', popular: false },
    { name: tp('pro'), price: tp('proPrice'), features: tp('proFeatures').split(', '), color: 'var(--primary)', popular: true },
    { name: tp('business'), price: tp('businessPrice'), features: tp('businessFeatures').split(', '), color: 'var(--warning)', popular: false },
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 80px', textAlign: 'center', background: 'linear-gradient(180deg, var(--background) 0%, var(--background-secondary) 100%)' }}>
        <div style={{ display: 'inline-block', padding: '6px 16px', border: '1px solid var(--primary)', borderRadius: '20px', fontSize: '13px', color: 'var(--primary)', marginBottom: '24px', fontWeight: 500 }}>
          Open Source &middot; AGPL-3.0
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1, maxWidth: '720px', marginBottom: '20px', background: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {t('heroTitle')}
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--foreground-muted)', maxWidth: '560px', lineHeight: 1.7, marginBottom: '32px' }}>
          {t('heroSubtitle')}
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/sign-up" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', background: 'var(--primary)', color: '#fff', borderRadius: 'var(--radius)', fontSize: '16px', fontWeight: 600, textDecoration: 'none', transition: 'background 0.15s' }}>
            {t('heroCta')}
          </Link>
          <a href="#pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', background: 'transparent', color: 'var(--foreground)', borderRadius: 'var(--radius)', fontSize: '16px', fontWeight: 500, textDecoration: 'none', border: '1px solid var(--border)' }}>
            {t('learnMore')}
          </a>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 700, textAlign: 'center', marginBottom: '48px' }}>
          Everything you need to grow
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="card" style={{ padding: '28px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: feature.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Icon size={24} style={{ color: feature.color }} />
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '8px' }}>{feature.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--foreground-muted)', lineHeight: 1.6 }}>{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '80px 24px', background: 'var(--background-secondary)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 700, textAlign: 'center', marginBottom: '8px' }}>{t('pricingTitle')}</h2>
          <p style={{ fontSize: '16px', color: 'var(--foreground-muted)', textAlign: 'center', marginBottom: '48px' }}>{t('pricingSubtitle')}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {plans.map((plan) => (
              <div key={plan.name} className="card" style={{ padding: '28px', border: plan.popular ? '2px solid var(--primary)' : undefined, position: 'relative' }}>
                {plan.popular && (
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', padding: '4px 16px', background: 'var(--primary)', color: '#fff', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                    Most Popular
                  </div>
                )}
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>{plan.name}</h3>
                <div style={{ fontSize: '36px', fontWeight: 800, color: plan.color, marginBottom: '4px' }}>{plan.price}</div>
                <div style={{ fontSize: '13px', color: 'var(--foreground-muted)', marginBottom: '20px' }}>{tp('perMonth')}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
                  {plan.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '6px 0', fontSize: '13px', color: 'var(--foreground-muted)' }}>
                      <Check size={16} style={{ color: plan.color, flexShrink: 0, marginTop: '1px' }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up" style={{ display: 'block', textAlign: 'center', padding: '10px 20px', background: plan.popular ? 'var(--primary)' : 'transparent', color: plan.popular ? '#fff' : 'var(--foreground)', border: plan.popular ? 'none' : '1px solid var(--border)', borderRadius: 'var(--radius)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
                  {plan.popular ? tp('upgrade') : tp('free') === plan.name ? tp('getStarted') : tp('contactSales')}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px 24px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <p style={{ fontSize: '13px', color: 'var(--foreground-muted)' }}>
          SocialForge &mdash; Open source social media management. Built with Next.js, Turso, and Clerk.
        </p>
      </footer>
    </div>
  );
}
