import { setRequestLocale } from 'next-intl/server';
import MediaLibraryClient from './media-client';

type Props = { params: Promise<{ locale: string }> };

export default async function MediaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <MediaLibraryClient />;
}
