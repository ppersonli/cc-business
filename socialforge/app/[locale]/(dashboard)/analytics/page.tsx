import { setRequestLocale } from 'next-intl/server';
type Props = { params: Promise<{ locale: string }> };
export default async function UanalyticsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Uanalytics</h1>
      <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--foreground-muted)' }}>
        Coming soon.
      </div>
    </div>
  );
}
