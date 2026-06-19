import Link from 'next/link'
import { getBuildFlowUser } from '@/lib/buildflow-auth'
import { initSchema, getBuildFlowProject, getBuildFlowColumns, getBuildFlowTasks } from '@/lib/db'
import { KanbanBoard } from '@/components/buildflow/KanbanBoard'
import type { Column, Task } from '@/components/buildflow/KanbanBoard'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getBuildFlowUser()
  if (!user) return null

  await initSchema()
  const projectId = Number(id)
  const project = await getBuildFlowProject(projectId, user.userId)
  if (!project) return <div style={{ padding: '40px', textAlign: 'center' }}>Project not found. <Link href="/buildflow/dashboard/projects">Back</Link></div>

  const cols = await getBuildFlowColumns(projectId).catch(() => [] as Column[])
  const allTasks = await getBuildFlowTasks(projectId).catch(() => [] as Task[])
  const taskMap: Record<number, Task[]> = {}
  for (const col of cols) { taskMap[col.id] = allTasks.filter((t) => t.column_id === col.id) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/buildflow/dashboard/projects" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>←</Link>
          <div style={{ width: '12px', height: '12px', borderRadius: '999px', backgroundColor: project.cover_color }} />
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>{project.name}</h1>
          <span style={{ fontSize: '12px', fontWeight: 500, padding: '2px 8px', borderRadius: '999px',
            backgroundColor: project.status === 'active' ? '#dcfce7' : '#dbeafe',
            color: project.status === 'active' ? '#15803d' : '#1d4ed8' }}>{project.status}</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '14px', color: '#6b7280' }}>
          {project.budget > 0 && <span>Budget: ${(project.budget / 1000).toFixed(0)}K</span>}
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <KanbanBoard projectId={projectId} initialColumns={cols as Column[]} initialTasks={taskMap} />
      </div>
    </div>
  )
}
