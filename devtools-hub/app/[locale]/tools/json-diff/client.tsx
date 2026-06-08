'use client'
import { useState } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('json-diff')!

interface DiffEntry {
  path: string
  type: 'added' | 'removed' | 'changed' | 'unchanged'
  left?: unknown
  right?: unknown
}

function flattenObject(obj: unknown, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  if (obj === null || typeof obj !== 'object') {
    result[prefix || '$root'] = obj
    return result
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      const key = prefix ? `${prefix}[${i}]` : `[${i}]`
      if (item !== null && typeof item === 'object') {
        Object.assign(result, flattenObject(item, key))
      } else {
        result[key] = item
      }
    })
    if (obj.length === 0) result[prefix || '$root'] = '[]'
    return result
  }
  const keys = Object.keys(obj as Record<string, unknown>)
  if (keys.length === 0) {
    result[prefix || '$root'] = '{}'
    return result
  }
  for (const key of keys) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    const val = (obj as Record<string, unknown>)[key]
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(result, flattenObject(val, fullKey))
    } else if (Array.isArray(val)) {
      Object.assign(result, flattenObject(val, fullKey))
    } else {
      result[fullKey] = val
    }
  }
  return result
}

function diffJSON(left: unknown, right: unknown): DiffEntry[] {
  const flatLeft = flattenObject(left)
  const flatRight = flattenObject(right)
  const allKeys = new Set([...Object.keys(flatLeft), ...Object.keys(flatRight)])
  const entries: DiffEntry[] = []

  for (const key of [...allKeys].sort()) {
    const inLeft = key in flatLeft
    const inRight = key in flatRight
    if (inLeft && !inRight) {
      entries.push({ path: key, type: 'removed', left: flatLeft[key] })
    } else if (!inLeft && inRight) {
      entries.push({ path: key, type: 'added', right: flatRight[key] })
    } else if (JSON.stringify(flatLeft[key]) !== JSON.stringify(flatRight[key])) {
      entries.push({ path: key, type: 'changed', left: flatLeft[key], right: flatRight[key] })
    } else {
      entries.push({ path: key, type: 'unchanged', left: flatLeft[key] })
    }
  }

  return entries
}

function formatValue(val: unknown): string {
  if (val === undefined) return 'undefined'
  if (val === null) return 'null'
  if (typeof val === 'string') return `"${val}"`
  return String(val)
}

export default function JsonDiff() {
  const [leftInput, setLeftInput] = useState('')
  const [rightInput, setRightInput] = useState('')
  const [diff, setDiff] = useState<DiffEntry[]>([])
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleCompare = () => {
    setError('')
    try {
      const left = JSON.parse(leftInput)
      const right = JSON.parse(rightInput)
      setDiff(diffJSON(left, right))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
      setDiff([])
    }
  }

  const handleCopy = async () => {
    const text = diff.map(d => {
      const prefix = d.type === 'added' ? '+' : d.type === 'removed' ? '-' : d.type === 'changed' ? '~' : ' '
      return `${prefix} ${d.path}: ${d.type === 'changed' ? `${formatValue(d.left)} → ${formatValue(d.right)}` : formatValue(d.type === 'removed' ? d.left : d.right)}`
    }).join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const added = diff.filter(d => d.type === 'added').length
  const removed = diff.filter(d => d.type === 'removed').length
  const changed = diff.filter(d => d.type === 'changed').length
  const unchanged = diff.filter(d => d.type === 'unchanged').length

  return (
    <ToolLayout tool={tool}>
      <div style={{ marginBottom: 16 }}>
        <div className="options-row">
          <button className="btn btn-primary" onClick={handleCompare}>Compare</button>
          <button className="btn" onClick={() => { setLeftInput(''); setRightInput(''); setDiff([]); setError(''); }}>Clear</button>
          {diff.length > 0 && (
            <button className="btn" onClick={handleCopy} style={{ marginLeft: 'auto' }}>
              {copied ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy Diff</>}
            </button>
          )}
        </div>
      </div>

      <div className="tool-grid">
        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Left JSON</span>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <textarea
              value={leftInput}
              onChange={e => setLeftInput(e.target.value)}
              placeholder='{"key": "value"}'
              style={{ border: 'none', borderRadius: 0, minHeight: 200, padding: 16 }}
              spellCheck={false}
            />
          </div>
        </div>

        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Right JSON</span>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <textarea
              value={rightInput}
              onChange={e => setRightInput(e.target.value)}
              placeholder='{"key": "new value"}'
              style={{ border: 'none', borderRadius: 0, minHeight: 200, padding: 16 }}
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error, #ef4444)', color: 'var(--error, #ef4444)', fontSize: 13 }}>
          {error}
        </div>
      )}

      {diff.length > 0 && (
        <div className="tool-panel" style={{ marginTop: 16 }}>
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Diff Result</span>
              <span style={{ fontSize: 12, color: '#22c55e' }}>+{added}</span>
              <span style={{ fontSize: 12, color: '#ef4444' }}>-{removed}</span>
              <span style={{ fontSize: 12, color: '#f59e0b' }}>~{changed}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{unchanged} unchanged</span>
            </div>
          </div>
          <div className="panel-body" style={{ padding: 0, maxHeight: 400, overflow: 'auto' }}>
            {diff.map((entry, i) => (
              <div
                key={i}
                style={{
                  padding: '6px 16px',
                  fontFamily: 'monospace',
                  fontSize: 13,
                  background: entry.type === 'added' ? 'rgba(34, 197, 94, 0.1)' :
                              entry.type === 'removed' ? 'rgba(239, 68, 68, 0.1)' :
                              entry.type === 'changed' ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  gap: 8,
                }}
              >
                <span style={{
                  color: entry.type === 'added' ? '#22c55e' :
                         entry.type === 'removed' ? '#ef4444' :
                         entry.type === 'changed' ? '#f59e0b' : 'var(--text-muted)',
                  fontWeight: 600,
                  minWidth: 16,
                }}>
                  {entry.type === 'added' ? '+' : entry.type === 'removed' ? '-' : entry.type === 'changed' ? '~' : ' '}
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>{entry.path}:</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {entry.type === 'changed'
                    ? `${formatValue(entry.left)} → ${formatValue(entry.right)}`
                    : formatValue(entry.type === 'removed' ? entry.left : entry.right)
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
