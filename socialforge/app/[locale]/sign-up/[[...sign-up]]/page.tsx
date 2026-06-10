import { setRequestLocale } from 'next-intl/server';
import { SignUp } from '@clerk/nextjs';

type Props = { params: Promise<{ locale: string }> };

export default async function SignUpPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background)' }}>
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: { backgroundColor: '#7c3aed', '&:hover': { backgroundColor: '#6d28d9' } },
            card: { backgroundColor: 'var(--card)', border: '1px solid var(--border)' },
          },
        }}
      />
    </div>
  );
}
