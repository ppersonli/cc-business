import { setRequestLocale } from 'next-intl/server';

type Props = { params: Promise<{ locale: string }> };

export default async function SettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Settings</h1>
      <div className="card" style={{ padding: '24px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          Account settings will be available soon.
        </p>
      </div>
    </div>
  );
}
