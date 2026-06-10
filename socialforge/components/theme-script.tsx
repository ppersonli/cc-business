'use client';

import { useEffect } from 'react';

export default function ThemeScript() {
  useEffect(() => {
    // Set theme from localStorage on mount
    const savedTheme = localStorage.getItem('socialforge-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return null;
}
