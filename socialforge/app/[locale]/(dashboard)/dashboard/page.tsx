import { getTranslations, setRequestLocale } from 'next-intl/server';

type Props = { params: Promise<{ locale: string }> };

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('dashboard');

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px' }}>{t('title')}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: t('totalPosts'), value: '0', color: 'var(--primary)' },
          { label: t('scheduledToday'), value: '0', color: 'var(--warning)' },
          { label: t('connectedAccounts'), value: '0', color: 'var(--success)' },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <p style={{ fontSize: '13px', color: 'var(--foreground-muted)', marginBottom: '4px' }}>{stat.label}</p>
            <p style={{ fontSize: '32px', fontWeight: 700, color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>
      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>{t('recentActivity')}</h2>
      <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--foreground-muted)' }}>
        No activity yet. Connect a social account to get started.
      </div>
    </div>
  );
}
