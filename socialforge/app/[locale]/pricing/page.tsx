import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Check } from 'lucide-react';

type Props = { params: Promise<{ locale: string }> };

export default async function PricingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pricing');

  const plans = [
    { name: t('free'), price: t('freePrice'), features: t('freeFeatures').split(', '), color: 'var(--border)', popular: false },
    { name: t('pro'), price: t('proPrice'), features: t('proFeatures').split(', '), color: 'var(--primary)', popular: true },
    { name: t('business'), price: t('businessPrice'), features: t('businessFeatures').split(', '), color: 'var(--warning)', popular: false },
  ];

  return (
    <div style={{ minHeight: '100vh', padding: '80px 24px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, textAlign: 'center', marginBottom: '8px' }}>{t('title')}</h1>
        <p style={{ fontSize: '16px', color: 'var(--foreground-muted)', textAlign: 'center', marginBottom: '48px' }}>
          Start free, upgrade when you need more.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {plans.map((plan) => (
            <div key={plan.name} className="card" style={{ padding: '32px', border: plan.popular ? '2px solid var(--primary)' : undefined, position: 'relative' }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', padding: '4px 16px', background: 'var(--primary)', color: '#fff', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                  Most Popular
                </div>
              )}
              <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>{plan.name}</h3>
              <div style={{ fontSize: '40px', fontWeight: 800, color: plan.color, marginBottom: '4px' }}>{plan.price}</div>
              <div style={{ fontSize: '13px', color: 'var(--foreground-muted)', marginBottom: '24px' }}>{t('perMonth')}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px' }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px 0', fontSize: '14px', color: 'var(--foreground-muted)', borderBottom: '1px solid var(--border)' }}>
                    <Check size={16} style={{ color: plan.color, flexShrink: 0, marginTop: '2px' }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up" style={{ display: 'block', textAlign: 'center', padding: '12px 24px', background: plan.popular ? 'var(--primary)' : 'transparent', color: plan.popular ? '#fff' : 'var(--foreground)', border: plan.popular ? 'none' : '1px solid var(--border)', borderRadius: 'var(--radius)', textDecoration: 'none', fontSize: '15px', fontWeight: 600 }}>
                {plan.popular ? t('upgrade') : t('free') === plan.name ? t('getStarted') : t('contactSales')}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
