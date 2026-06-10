import { setRequestLocale } from 'next-intl/server';
import { getBookingPageBySlug } from '@/lib/db';
import { notFound } from 'next/navigation';
import PublicBookingPage from '@/components/PublicBookingPage';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function BookPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const page = await getBookingPageBySlug(slug);
  if (!page) notFound();

  return <PublicBookingPage slug={slug} />;
}
