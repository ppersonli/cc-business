'use client'
import { useState, useCallback } from 'react'
import {
  DndContext, DragOverlay, closestCorners, useSensor, useSensors, PointerSensor,
  type DragStartEvent, type DragEndEvent, type DragOverEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'

export interface Column { id: number; name: string; color: string; position: number }
export interface Task { id: number; title: string; description: string; priority: string; category: string; column_id: number; due_date: string | null; tags: string; comments_count: number; attachments: number }

interface Props { projectId: number; initialColumns: Column[]; initialTasks: Record<number, Task[]> }

export function KanbanBoard({ projectId, initialColumns, initialTasks }: Props) {
  const [columns] = useState(initialColumns)
  const [tasks, setTasks] = useState(initialTasks)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const findCol = useCallback((taskId: number) => {
    return Object.keys(tasks).map(Number).find((colId) => tasks[colId]?.some((t) => t.id === taskId))
  }, [tasks])

  const onDragStart = (e: DragStartEvent) => {
    const task = Object.values(tasks).flat().find((t) => t.id === e.active.id)
    if (task) setActiveTask(task)
  }

  const onDragOver = (e: DragOverEvent) => {
    const { active, over } = e
    if (!over) return
    const activeCol = findCol(active.id as number)
    const overCol = findCol(over.id as number) ?? (columns.find((c) => c.id === over.id)?.id as number | undefined)
    if (activeCol == null || overCol == null || activeCol === overCol) return
    setTasks((prev) => {
      const from = prev[activeCol] || []
      const to = prev[overCol] || []
      const idx = from.findIndex((t) => t.id === active.id)
      const moved = from[idx]
      const newFrom = [...from]; newFrom.splice(idx, 1)
      const overIdx = to.findIndex((t) => t.id === over.id)
      const newTo = [...to]; newTo.splice(overIdx >= 0 ? overIdx : newTo.length, 0, moved)
      return { ...prev, [activeCol]: newFrom, [overCol]: newTo }
    })
  }

  const onDragEnd = (e: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = e
    if (!over) return
    const activeCol = findCol(active.id as number)
    const overCol = findCol(over.id as number)
    if (activeCol == null || overCol == null) return
    if (activeCol === overCol) {
      setTasks((prev) => {
        const items = prev[activeCol]
        const oldIdx = items.findIndex((t) => t.id === active.id)
        const newIdx = items.findIndex((t) => t.id === over.id)
        return { ...prev, [activeCol]: arrayMove(items, oldIdx, newIdx) }
      })
    }
    fetch(`/api/buildflow/projects/${projectId}/tasks/${active.id}/move`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columnId: overCol }),
    }).catch(console.error)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', padding: '16px 24px', minHeight: 'calc(100vh - 140px)' }}>
        {columns.map((col) => (
          <KanbanColumn key={col.id} column={col} tasks={tasks[col.id] || []} projectId={projectId} />
        ))}
        <button onClick={() => {
          fetch(`/api/buildflow/projects/${projectId}/columns`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'New Column', position: columns.length }),
          }).then((r) => r.json()).then((col) => {
            window.location.reload()
          }).catch(console.error)
        }}
          style={{ flexShrink: 0, width: '288px', height: '48px', borderRadius: '12px', border: '2px dashed #d1d5db', backgroundColor: 'transparent', color: '#6b7280', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
          + Add Column
        </button>
      </div>
      <DragOverlay>{activeTask ? <TaskCard task={activeTask} isDragging /> : null}</DragOverlay>
    </DndContext>
  )
}
