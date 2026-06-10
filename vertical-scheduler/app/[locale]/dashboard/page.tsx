import { getTranslations, setRequestLocale } from 'next-intl/server';
import { auth } from '@/auth';
import { getBookingPagesByUserId } from '@/lib/db';
import { Link } from '@/i18n/navigation';

type Props = { params: Promise<{ locale: string }> };

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('dashboard');
  const session = await auth();

  let pageCount = 0;
  if (session?.user?.id) {
    const pages = await getBookingPagesByUserId(session.user.id);
    pageCount = pages.length;
  }

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
        {t('welcome')}{session?.user?.name ? `, ${session.user.name}` : ''}
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '15px' }}>
        {t('title')}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="card">
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('totalPages')}</p>
          <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--accent)' }}>{pageCount}</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600 }}>{t('yourPages')}</h2>
        <Link href="/dashboard/pages/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          + {t('createPage')}
        </Link>
      </div>

      {pageCount === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>{t('noPages')}</p>
          <Link href="/dashboard/pages/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            + {t('createPage')}
          </Link>
        </div>
      )}
    </div>
  );
}
