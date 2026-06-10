import { setRequestLocale } from 'next-intl/server';
import AccountsClient from './accounts-client';

type Props = { params: Promise<{ locale: string }> };

export default async function AccountsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AccountsClient />;
}
