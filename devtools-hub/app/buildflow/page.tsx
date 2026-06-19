import Link from 'next/link'
import { getBuildFlowUser } from '@/lib/buildflow-auth'

export default async function BuildFlowLanding() {
  const user = await getBuildFlowUser()

  return (
    <main style={{ minHeight: '100vh' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 20h20" /><path d="M5 20V8l7-5 7 5v12" /><path d="M9 20v-6h6v6" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '18px' }}>BuildFlow</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" style={{ fontSize: '14px', color: '#64748b', textDecoration: 'none' }}>DevTools Hub</Link>
          {user ? (
            <Link href="/buildflow/dashboard/projects" style={{ fontSize: '14px', fontWeight: 600, color: '#374151', textDecoration: 'none' }}>Dashboard</Link>
          ) : (
            <Link href="/auth/google/webhook" style={{ fontSize: '14px', fontWeight: 600, color: '#374151', textDecoration: 'none' }}>Sign In</Link>
          )}
        </div>
      </nav>

      <section style={{ textAlign: 'center', padding: '80px 24px 64px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '999px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontSize: '12px', fontWeight: 500, marginBottom: '24px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '999px', backgroundColor: '#f59e0b' }}></span>
          Built for construction teams
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1, color: '#111827', margin: 0 }}>
          Manage construction projects<br /><span style={{ color: '#d97706' }}>without the chaos</span>
        </h1>
        <p style={{ marginTop: '24px', fontSize: '18px', color: '#6b7280', lineHeight: 1.6, maxWidth: '600px', margin: '24px auto 0' }}>
          Visual kanban boards, document management, and team collaboration — all in one place.
        </p>
        <div style={{ marginTop: '40px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link href={user ? '/buildflow/dashboard/projects' : '/buildflow/dashboard/projects'}
            style={{ padding: '12px 24px', borderRadius: '8px', backgroundColor: '#d97706', color: '#fff', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
            {user ? 'Go to Dashboard' : 'Start Free Trial'}
          </Link>
        </div>
        <p style={{ marginTop: '16px', fontSize: '12px', color: '#9ca3af' }}>No credit card required · 14-day free trial</p>
      </section>

      <section style={{ padding: '80px 24px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, textAlign: 'center', color: '#111827', marginBottom: '48px' }}>Everything your team needs</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {[
              { icon: '📋', title: 'Visual Kanban Boards', desc: 'Drag-and-drop tasks across custom columns. Track progress from planning to completion.' },
              { icon: '📁', title: 'Document Management', desc: 'Upload drawings, contracts, permits, and change orders. Version control built in.' },
              { icon: '👷', title: 'Team Collaboration', desc: 'Assign tasks, add comments, and track who is responsible for what.' },
              { icon: '📱', title: 'Mobile Responsive', desc: 'Access your projects from any device. Works great on tablets at the job site.' },
              { icon: '📊', title: 'Project Dashboard', desc: 'See budget, timeline, and task progress at a glance.' },
              { icon: '🔒', title: 'Industry Categories', desc: 'Pre-built categories for electrical, plumbing, structural, inspection, and more.' },
            ].map((f) => (
              <div key={f.title} style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{f.icon}</div>
                <h3 style={{ fontWeight: 600, color: '#111827', marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid #e5e7eb', padding: '32px 24px', textAlign: 'center', fontSize: '14px', color: '#9ca3af' }}>
        <p>&copy; {new Date().getFullYear()} BuildFlow — Part of <Link href="/" style={{ color: '#6b7280' }}>DevTools Hub</Link></p>
      </footer>
    </main>
  )
}
