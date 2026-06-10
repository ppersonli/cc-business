'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { useEffect } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const theme = localStorage.getItem('socialforge-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  return <ClerkProvider>{children}</ClerkProvider>;
}
