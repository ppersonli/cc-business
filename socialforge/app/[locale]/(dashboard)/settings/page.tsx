import { getTranslations, setRequestLocale } from 'next-intl/server';
type Props = { params: Promise<{ locale: string }> };
export default async function SettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('settings');
  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>{t('title')}</h1>
      <div className="card" style={{ padding: '24px' }}>
        <p style={{ color: 'var(--foreground-muted)' }}>Settings will be available soon.</p>
      </div>
    </div>
  );
}
