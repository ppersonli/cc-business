'use client';

import { usePathname } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((segment, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/');
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    return { href, label, isLast: i === segments.length - 1 };
  });

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 0', fontSize: '14px' }}>
      <Link href="/dashboard" style={{ color: 'var(--foreground-muted)', textDecoration: 'none' }}>
        Home
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ChevronRight size={14} style={{ color: 'var(--foreground-muted)' }} />
          {crumb.isLast ? (
            <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>{crumb.label}</span>
          ) : (
            <Link href={crumb.href} style={{ color: 'var(--foreground-muted)', textDecoration: 'none' }}>
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
