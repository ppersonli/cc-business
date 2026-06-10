import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import PostsListClient from './posts-list-client';

type Props = { params: Promise<{ locale: string }> };

export default async function PostsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('posts');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>{t('title')}</h1>
        <Link href="/posts/new" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: 500 }}>
          + {t('create')}
        </Link>
      </div>
      <PostsListClient />
    </div>
  );
}
