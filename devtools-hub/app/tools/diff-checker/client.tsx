'use client'
import { useState, useMemo, useCallback } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('diff-checker')!

interface DiffLine {
  type: 'equal' | 'added' | 'removed' | 'changed'
  leftNum: number | null
  rightNum: number | null
  left: string
  right: string
}

function computeDiff(textA: string, textB: string): DiffLine[] {
  const linesA = textA.split('\n')
  const linesB = textB.split('\n')
  const result: DiffLine[] = []

  const maxLen = Math.max(linesA.length, linesB.length)

  for (let i = 0; i < maxLen; i++) {
    const a = i < linesA.length ? linesA[i] : undefined
    const b = i < linesB.length ? linesB[i] : undefined

    if (a === undefined) {
      result.push({ type: 'added', leftNum: null, rightNum: i + 1, left: '', right: b! })
    } else if (b === undefined) {
      result.push({ type: 'removed', leftNum: i + 1, rightNum: null, left: a, right: '' })
    } else if (a === b) {
      result.push({ type: 'equal', leftNum: i + 1, rightNum: i + 1, left: a, right: b })
    } else {
      result.push({ type: 'changed', leftNum: i + 1, rightNum: i + 1, left: a, right: b })
    }
  }

  return result
}

const COLORS = {
  equal: { bg: 'transparent', border: 'transparent' },
  added: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' },
  removed: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
  changed: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
}

const LABELS = {
  equal: '',
  added: '+',
  removed: '-',
  changed: '~',
}

const LABEL_COLORS = {
  equal: 'transparent',
  added: '#22c55e',
  removed: '#ef4444',
  changed: '#f59e0b',
}

export default function DiffChecker() {
  const [textA, setTextA] = useState('')
  const [textB, setTextB] = useState('')
  const [copied, setCopied] = useState(false)

  const diff = useMemo(() => computeDiff(textA, textB), [textA, textB])

  const stats = useMemo(() => {
    const added = diff.filter(d => d.type === 'added').length
    const removed = diff.filter(d => d.type === 'removed').length
    const changed = diff.filter(d => d.type === 'changed').length
    const equal = diff.filter(d => d.type === 'equal').length
    return { added, removed, changed, equal, total: diff.length }
  }, [diff])

  const copyDiff = useCallback(() => {
    const text = diff.map(d => `${LABELS[d.type]} ${d.left || d.right}`).join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [diff])

  return (
    <ToolLayout tool={tool}>
      <div className="tool-grid">
        <div className="tool-panel">
          <div className="panel-header">
            <span>Original Text</span>
            {textA && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{textA.split('\n').length} lines</span>}
          </div>
          <div className="panel-body">
            <textarea
              value={textA}
              onChange={(e) => setTextA(e.target.value)}
              placeholder="Paste original text here..."
              style={{
                width: '100%',
                minHeight: 200,
                padding: 12,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                resize: 'vertical',
                lineHeight: 1.6,
              }}
            />
          </div>
        </div>

        <div className="tool-panel">
          <div className="panel-header">
            <span>Modified Text</span>
            {textB && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{textB.split('\n').length} lines</span>}
          </div>
          <div className="panel-body">
            <textarea
              value={textB}
              onChange={(e) => setTextB(e.target.value)}
              placeholder="Paste modified text here..."
              style={{
                width: '100%',
                minHeight: 200,
                padding: 12,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                resize: 'vertical',
                lineHeight: 1.6,
              }}
            />
          </div>
        </div>
      </div>

      {diff.length > 0 && (textA || textB) && (
        <>
          <div className="options-row" style={{ marginTop: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
              <span style={{ color: '#22c55e' }}>+{stats.added} added</span>
              <span style={{ color: '#ef4444' }}>-{stats.removed} removed</span>
              <span style={{ color: '#f59e0b' }}>~{stats.changed} changed</span>
              <span style={{ color: 'var(--text-muted)' }}>{stats.equal} unchanged</span>
            </div>
            <button className="btn btn-sm" onClick={copyDiff}>
              {copied ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy Diff</>}
            </button>
          </div>

          <div className="tool-panel" style={{ marginTop: 8 }}>
            <div className="panel-header">
              <span>Diff Result</span>
            </div>
            <div className="panel-body" style={{ padding: 0, overflow: 'auto', maxHeight: 500 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                <tbody>
                  {diff.map((line, i) => (
                    <tr key={i} style={{ background: COLORS[line.type].bg }}>
                      <td style={{ width: 36, padding: '2px 8px', textAlign: 'right', color: 'var(--text-muted)', fontSize: 11, userSelect: 'none', borderRight: '1px solid var(--border)' }}>
                        {line.leftNum ?? ''}
                      </td>
                      <td style={{ width: 36, padding: '2px 8px', textAlign: 'right', color: 'var(--text-muted)', fontSize: 11, userSelect: 'none', borderRight: '1px solid var(--border)' }}>
                        {line.rightNum ?? ''}
                      </td>
                      <td style={{ width: 20, padding: '2px 4px', textAlign: 'center', color: LABEL_COLORS[line.type], fontWeight: 700, fontSize: 12 }}>
                        {LABELS[line.type]}
                      </td>
                      <td style={{ padding: '2px 12px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: line.type === 'equal' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                        {line.type === 'removed' ? line.left : line.right}
                        {line.type === 'changed' && (
                          <span style={{ color: 'var(--text-muted)', marginLeft: 8, fontSize: 11 }}>
                            (was: {line.left})
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </ToolLayout>
  )
}
