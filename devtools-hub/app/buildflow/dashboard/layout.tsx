import Link from 'next/link'
import { getBuildFlowUser } from '@/lib/buildflow-auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getBuildFlowUser()
  if (!user) redirect('/buildflow')

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8fafc' }}>
      <aside style={{ width: '240px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e2e8f0', backgroundColor: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 20h20" /><path d="M5 20V8l7-5 7 5v12" /><path d="M9 20v-6h6v6" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '18px' }}>BuildFlow</span>
        </div>
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Link href="/buildflow/dashboard/projects" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', fontSize: '14px', color: '#374151', textDecoration: 'none', fontWeight: 500 }}>📋 Projects</Link>
        </nav>
        <div style={{ padding: '16px 12px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', padding: '0 12px' }}>{user.email}</div>
          <Link href="/" style={{ display: 'block', fontSize: '12px', color: '#64748b', padding: '8px 12px', textDecoration: 'none' }}>← DevTools Hub</Link>
        </div>
      </aside>
      <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
    </div>
  )
}
