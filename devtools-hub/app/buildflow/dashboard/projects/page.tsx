import Link from 'next/link'
import { getBuildFlowUser } from '@/lib/buildflow-auth'
import { initSchema, getBuildFlowProjects } from '@/lib/db'

export default async function ProjectsPage() {
  const user = await getBuildFlowUser()
  if (!user) return null

  await initSchema()
  let projects: any[] = []
  try { projects = await getBuildFlowProjects(user.userId) } catch { projects = [] }

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>Projects</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Manage your construction projects</p>
        </div>
        <Link href="/buildflow/dashboard/projects/new"
          style={{ padding: '10px 20px', backgroundColor: '#d97706', color: '#fff', fontSize: '14px', fontWeight: 600, borderRadius: '8px', textDecoration: 'none' }}>
          + New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏗️</div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>No projects yet</h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>Create your first construction project to get started</p>
          <Link href="/buildflow/dashboard/projects/new"
            style={{ display: 'inline-block', padding: '12px 24px', backgroundColor: '#d97706', color: '#fff', fontSize: '14px', fontWeight: 600, borderRadius: '8px', textDecoration: 'none' }}>
            Create First Project
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {projects.map((p: any) => (
            <Link key={p.id} href={`/buildflow/dashboard/projects/${p.id}`}
              style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '999px', backgroundColor: p.cover_color }} />
                <span style={{ fontSize: '12px', fontWeight: 500, padding: '2px 8px', borderRadius: '999px',
                  backgroundColor: p.status === 'active' ? '#dcfce7' : '#dbeafe',
                  color: p.status === 'active' ? '#15803d' : '#1d4ed8' }}>{p.status}</span>
              </div>
              <h3 style={{ fontWeight: 600, color: '#111827', margin: 0 }}>{p.name}</h3>
              <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{p.description || 'No description'}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
