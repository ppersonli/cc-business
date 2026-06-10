import { getTranslations, setRequestLocale } from 'next-intl/server';
import { auth } from '@/auth';
import { getBookingPageById } from '@/lib/db';
import { notFound } from 'next/navigation';
import BookingPageForm from '@/components/BookingPageForm';

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function EditPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages');
  const session = await auth();

  const page = await getBookingPageById(id);
  if (!page || page.user_id !== session?.user?.id) {
    notFound();
  }

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>{t('edit')}</h1>
      <BookingPageForm
        initialData={{
          id: page.id,
          title: page.title,
          slug: page.slug,
          description: page.description,
          brand_color: page.brand_color,
        }}
      />
    </div>
  );
}
