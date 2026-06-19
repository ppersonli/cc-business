'use client'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from './KanbanBoard'

const priorityColors: Record<string, string> = { low: '#94a3b8', medium: '#3b82f6', high: '#f59e0b', urgent: '#ef4444' }
const categoryIcons: Record<string, string> = { general: '📋', electrical: '⚡', plumbing: '🔧', structural: '🏗️', inspection: '🔍', material: '📦', safety: '⚠️' }

export function TaskCard({ task, isDragging }: { task: Task; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id, data: { type: 'task', task } })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  let tags: string[] = []
  try { tags = JSON.parse(task.tags || '[]') } catch { tags = [] }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className="bg-white p-3.5 rounded-lg border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: priorityColors[task.priority] || '#94a3b8' }} />
        <span className="text-[11px] text-gray-400">{categoryIcons[task.category] || '📋'} {task.category}</span>
      </div>
      <h4 className="text-sm font-medium text-gray-900 leading-snug">{task.title}</h4>
      {task.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.map((t) => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{t}</span>)}
        </div>
      )}
      <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-400">
        {task.due_date && <span className={new Date(task.due_date) < new Date() ? 'text-red-500' : ''}>📅 {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
        {task.comments_count > 0 && <span>💬 {task.comments_count}</span>}
        {task.attachments > 0 && <span>📎 {task.attachments}</span>}
      </div>
    </div>
  )
}
