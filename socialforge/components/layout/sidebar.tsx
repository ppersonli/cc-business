'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import {
  LayoutDashboard, FileText, Calendar, Image, BarChart3,
  Share2, Settings, ChevronLeft, ChevronRight
} from 'lucide-react';

const navItems = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'posts', href: '/posts', icon: FileText },
  { key: 'calendar', href: '/calendar', icon: Calendar },
  { key: 'media', href: '/media', icon: Image },
  { key: 'analytics', href: '/analytics', icon: BarChart3 },
  { key: 'accounts', href: '/accounts', icon: Share2 },
  { key: 'settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const sidebarWidth = collapsed ? 64 : 260;

  const navContent = (
    <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.key}
            href={item.href}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 12px', borderRadius: 'var(--radius)',
              color: isActive ? '#ffffff' : 'var(--foreground-muted)',
              backgroundColor: isActive ? 'var(--primary)' : 'transparent',
              textDecoration: 'none', fontSize: '14px', fontWeight: isActive ? 600 : 400,
              marginBottom: '2px', transition: 'all 0.15s',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
            title={collapsed ? t(item.key) : undefined}
          >
            <Icon size={20} />
            {!collapsed && <span>{t(item.key)}</span>}
          </Link>
        );
      })}
    </nav>
  );

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setMobileOpen(true)}
          style={{
            position: 'fixed', top: '12px', left: '12px', zIndex: 1000,
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '8px', cursor: 'pointer',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1001 }} />}
        <aside style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width: '260px',
          backgroundColor: 'var(--background-secondary)', borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', zIndex: 1002,
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.2s ease',
        }}>
          <div style={{ padding: '16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)' }}>SocialForge</span>
            <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--foreground-muted)', cursor: 'pointer', fontSize: '20px' }}>&times;</button>
          </div>
          {navContent}
        </aside>
      </>
    );
  }

  return (
    <aside style={{
      width: sidebarWidth, flexShrink: 0,
      backgroundColor: 'var(--background-secondary)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', transition: 'width 0.2s ease',
    }}>
      <div style={{ padding: '16px 12px', display: 'flex', justifyContent: collapsed ? 'center' : 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        {!collapsed && <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)' }}>SocialForge</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{ background: 'none', border: 'none', color: 'var(--foreground-muted)', cursor: 'pointer', padding: '4px' }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      {navContent}
    </aside>
  );
}
