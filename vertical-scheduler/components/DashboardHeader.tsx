'use client';

import { useSession, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';

export default function DashboardHeader() {
  const { data: session } = useSession();
  const t = useTranslations('common');

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '12px 24px',
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border)',
        gap: '12px',
      }}
    >
      {session?.user && (
        <>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {session.user.name || session.user.email}
          </span>
          {session.user.image && (
            <img
              src={session.user.image}
              alt=""
              width={32}
              height={32}
              style={{ borderRadius: '50%' }}
            />
          )}
          <button
            className="btn"
            onClick={() => signOut()}
            style={{ fontSize: '13px', padding: '6px 12px' }}
          >
            {t('signOut')}
          </button>
        </>
      )}
    </header>
  );
}
