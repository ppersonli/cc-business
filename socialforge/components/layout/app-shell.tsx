'use client';

import Sidebar from './sidebar';
import Breadcrumb from './breadcrumb';
import MobileTabBar from './mobile-tab-bar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ padding: '0 24px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>
          <Breadcrumb />
        </header>
        <main style={{ flex: 1, padding: '24px', overflow: 'auto', paddingBottom: '80px' }}>
          {children}
        </main>
      </div>
      <MobileTabBar />
      <style>{`
        @media (max-width: 767px) {
          .mobile-tab-bar { display: block !important; }
        }
      `}</style>
    </div>
  );
}
