import { setRequestLocale } from 'next-intl/server';
import { auth } from '@/auth';
import { getBookingPageById } from '@/lib/db';
import { notFound } from 'next/navigation';
import ServiceManager from '@/components/ServiceManager';
import AvailabilityManager from '@/components/AvailabilityManager';
import { Link } from '@/i18n/navigation';

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function PageServicesPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const session = await auth();

  const page = await getBookingPageById(id);
  if (!page || page.user_id !== session?.user?.id) notFound();

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Link href="/dashboard/pages" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>
          &larr; Back
        </Link>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>{page.title}</h1>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/book/{page.slug}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        <div>
          <ServiceManager pageId={page.id} brandColor={page.brand_color} />
        </div>
        <div>
          <AvailabilityManager pageId={page.id} brandColor={page.brand_color} />
        </div>
      </div>
    </div>
  );
}
