'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { LayoutDashboard, FileText, Calendar, BarChart3, Settings } from 'lucide-react';

const tabs = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'posts', href: '/posts', icon: FileText },
  { key: 'calendar', href: '/calendar', icon: Calendar },
  { key: 'analytics', href: '/analytics', icon: BarChart3 },
  { key: 'settings', href: '/settings', icon: Settings },
];

export default function MobileTabBar() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      display: 'none', /* shown via media query in app-shell */
      backgroundColor: 'var(--background-secondary)',
      borderTop: '1px solid var(--border)',
      padding: '4px 0',
      zIndex: 100,
    }}
    className="mobile-tab-bar"
    >
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== '/dashboard' && pathname.startsWith(tab.href));
          const Icon = tab.icon;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                padding: '6px 12px', textDecoration: 'none',
                color: isActive ? 'var(--primary)' : 'var(--foreground-muted)',
                fontSize: '11px', fontWeight: isActive ? 600 : 400,
              }}
            >
              <Icon size={20} />
              <span>{t(tab.key)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
