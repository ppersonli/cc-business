'use client'
import { useState, useCallback } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('uuid-generator')!

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export default function UuidGenerator() {
  const [count, setCount] = useState(1)
  const [uuids, setUuids] = useState<string[]>([generateUUID()])
  const [copied, setCopied] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const generate = useCallback(() => {
    const n = Math.min(Math.max(count, 1), 100)
    setUuids(Array.from({ length: n }, () => generateUUID()))
    setCopied(false)
    setCopiedIndex(null)
  }, [count])

  const copyAll = useCallback(() => {
    navigator.clipboard.writeText(uuids.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [uuids])

  const copyOne = useCallback((uuid: string, index: number) => {
    navigator.clipboard.writeText(uuid)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 1500)
  }, [])

  return (
    <ToolLayout tool={tool}>
      <div className="options-row">
        <div className="option-group">
          <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Count:
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            style={{
              width: 72,
              padding: '6px 10px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              color: 'var(--text-primary)',
              fontSize: 13,
            }}
          />
        </div>
        <button className="btn btn-primary" onClick={generate}>
          Generate
        </button>
        <button className="btn" onClick={copyAll}>
          {copied ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy All</>}
        </button>
      </div>

      <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
        {uuids.length} UUID{uuids.length !== 1 ? 's' : ''} generated
      </div>

      <div className="tool-panel" style={{ marginTop: 16 }}>
        <div className="panel-body" style={{ padding: 0 }}>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {uuids.map((uuid, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 16px',
                  borderBottom: i < uuids.length - 1 ? '1px solid var(--border)' : 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                }}
              >
                <span style={{ color: 'var(--text-muted)', marginRight: 12, minWidth: 32, fontSize: 11 }}>
                  {i + 1}.
                </span>
                <span style={{ flex: 1, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                  {uuid}
                </span>
                <button
                  className="btn btn-sm"
                  onClick={() => copyOne(uuid, i)}
                  style={{ marginLeft: 12, flexShrink: 0 }}
                >
                  {copiedIndex === i ? <CheckIcon /> : <CopyIcon />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
