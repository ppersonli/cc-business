import { getTranslations, setRequestLocale } from 'next-intl/server';
import { auth } from '@/auth';
import { getBookingPagesByUserId } from '@/lib/db';
import { Link } from '@/i18n/navigation';
import DeletePageButton from './DeletePageButton';

type Props = { params: Promise<{ locale: string }> };

export default async function PagesListPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages');
  const tc = await getTranslations('common');
  const session = await auth();

  const pages = session?.user?.id ? await getBookingPagesByUserId(session.user.id) : [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>{t('title')}</h1>
        <Link href="/dashboard/pages/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          + {t('create')}
        </Link>
      </div>

      {pages.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '15px' }}>
            No booking pages yet
          </p>
          <Link href="/dashboard/pages/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            + {t('create')}
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {pages.map((page) => (
            <div key={page.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {page.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  /book/{page.slug}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link href={`/dashboard/pages/${page.id}/services`} className="btn" style={{ textDecoration: 'none', fontSize: '13px', padding: '6px 12px', background: 'var(--accent-light)', color: 'var(--accent)', borderColor: 'var(--accent-light)' }}>
                  Services
                </Link>
                <Link href={`/dashboard/pages/${page.id}`} className="btn" style={{ textDecoration: 'none', fontSize: '13px', padding: '6px 12px' }}>
                  {tc('edit')}
                </Link>
                <DeletePageButton pageId={page.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
