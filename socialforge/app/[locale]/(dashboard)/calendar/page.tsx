import { setRequestLocale } from 'next-intl/server';
import CalendarClient from './calendar-client';

type Props = { params: Promise<{ locale: string }> };

export default async function CalendarPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CalendarClient />;
}
