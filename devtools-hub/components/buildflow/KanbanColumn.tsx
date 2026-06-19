'use client'
import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TaskCard } from './TaskCard'
import type { Column, Task } from './KanbanBoard'

export function KanbanColumn({ column, tasks, projectId }: { column: Column; tasks: Task[]; projectId: number }) {
  const [showAdd, setShowAdd] = useState(false)
  const [title, setTitle] = useState('')
  const { setNodeRef, isOver } = useDroppable({ id: column.id, data: { type: 'column' } })

  const addTask = async () => {
    if (!title.trim()) return
    try {
      await fetch(`/api/buildflow/projects/${projectId}/tasks`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), columnId: column.id, position: tasks.length }),
      })
      setTitle(''); setShowAdd(false)
      window.location.reload()
    } catch (err) { console.error(err) }
  }

  return (
    <div style={{ flexShrink: 0, width: '288px', display: 'flex', flexDirection: 'column', backgroundColor: '#f1f5f9', borderRadius: '12px', maxHeight: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '999px', backgroundColor: column.color }} />
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', margin: 0 }}>{column.name}</h3>
          <span style={{ fontSize: '12px', color: '#94a3b8', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '999px' }}>{tasks.length}</span>
        </div>
      </div>
      <div ref={setNodeRef}
        style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '60px', borderRadius: '8px', transition: 'background-color 0.2s',
          backgroundColor: isOver ? '#fef3c7' : 'transparent', boxShadow: isOver ? 'inset 0 0 0 2px #fbbf24' : 'none' }}>
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => <TaskCard key={task.id} task={task} />)}
        </SortableContext>
        {showAdd ? (
          <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <textarea autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addTask() } if (e.key === 'Escape') { setShowAdd(false); setTitle('') } }}
              placeholder="Enter task title..." style={{ width: '100%', fontSize: '14px', border: 'none', outline: 'none', resize: 'none' }} rows={2} />
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button onClick={addTask} style={{ padding: '6px 12px', backgroundColor: '#d97706', color: '#fff', fontSize: '12px', fontWeight: 500, borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Add</button>
              <button onClick={() => { setShowAdd(false); setTitle('') }} style={{ padding: '6px 12px', color: '#6b7280', fontSize: '12px', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAdd(true)} style={{ width: '100%', padding: '8px', fontSize: '14px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '8px' }}>
            + Add task
          </button>
        )}
      </div>
    </div>
  )
}
