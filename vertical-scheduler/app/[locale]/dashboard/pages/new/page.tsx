import { getTranslations, setRequestLocale } from 'next-intl/server';
import BookingPageForm from '@/components/BookingPageForm';

type Props = { params: Promise<{ locale: string }> };

export default async function NewPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages');

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>{t('create')}</h1>
      <BookingPageForm />
    </div>
  );
}
