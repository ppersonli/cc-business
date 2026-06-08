'use client'
import { useState, useCallback } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('markdown-table-generator')!

const SAMPLE_ROWS = [
  ['Name', 'Age', 'City'],
  ['Alice', '30', 'New York'],
  ['Bob', '25', 'San Francisco'],
  ['Charlie', '35', 'Seattle'],
]

function rowsToMarkdown(rows: string[][]): string {
  if (rows.length === 0) return ''
  const header = rows[0]
  const separator = header.map(() => '---')
  const body = rows.slice(1)
  const lines = [
    '| ' + header.join(' | ') + ' |',
    '| ' + separator.join(' | ') + ' |',
    ...body.map(row => '| ' + row.join(' | ') + ' |'),
  ]
  return lines.join('\n')
}

function rowsToHtml(rows: string[][]): string {
  if (rows.length === 0) return ''
  const header = rows[0]
  const body = rows.slice(1)
  const ths = header.map(h => `<th>${escapeHtml(h)}</th>`).join('')
  const trs = body.map(row => {
    const tds = row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')
    return `<tr>${tds}</tr>`
  }).join('\n')
  return `<table>\n<thead>\n<tr>${ths}</tr>\n</thead>\n<tbody>\n${trs}\n</tbody>\n</table>`
}

function rowsToCsv(rows: string[][]): string {
  return rows.map(row =>
    row.map(cell => {
      if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
        return '"' + cell.replace(/"/g, '""') + '"'
      }
      return cell
    }).join(',')
  ).join('\n')
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export default function MarkdownTableGenerator() {
  const [rows, setRows] = useState<string[][]>(SAMPLE_ROWS)
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null)
  const [alignments, setAlignments] = useState<('left' | 'center' | 'right')[]>([])

  const markdown = rowsToMarkdown(rows)
  const html = rowsToHtml(rows)
  const csv = rowsToCsv(rows)

  const copy = useCallback((text: string, target: string) => {
    navigator.clipboard.writeText(text)
    setCopiedTarget(target)
    setTimeout(() => setCopiedTarget(null), 1500)
  }, [])

  const updateCell = (rowIdx: number, colIdx: number, value: string) => {
    const newRows = rows.map((row, ri) =>
      ri === rowIdx ? row.map((cell, ci) => (ci === colIdx ? value : cell)) : [...row]
    )
    setRows(newRows)
  }

  const addRow = () => {
    const colCount = rows[0]?.length || 3
    setRows([...rows, Array(colCount).fill('')])
  }

  const removeRow = (idx: number) => {
    if (rows.length <= 1) return
    setRows(rows.filter((_, i) => i !== idx))
  }

  const addColumn = () => {
    setRows(rows.map(row => [...row, '']))
  }

  const removeColumn = (colIdx: number) => {
    if (rows[0]?.length <= 1) return
    setRows(rows.map(row => row.filter((_, i) => i !== colIdx)))
  }

  const setAlignment = (colIdx: number, align: 'left' | 'center' | 'right') => {
    const newAlignments = [...alignments]
    newAlignments[colIdx] = align
    setAlignments(newAlignments)
  }

  return (
    <ToolLayout tool={tool}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <button className="btn btn-sm" onClick={addRow}>+ Row</button>
          <button className="btn btn-sm" onClick={addColumn}>+ Column</button>
          <div style={{ flex: 1 }} />
          <button className="btn btn-sm" onClick={() => copy(markdown, 'md')}>
            {copiedTarget === 'md' ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy Markdown</>}
          </button>
          <button className="btn btn-sm" onClick={() => copy(html, 'html')}>
            {copiedTarget === 'html' ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy HTML</>}
          </button>
          <button className="btn btn-sm" onClick={() => copy(csv, 'csv')}>
            {copiedTarget === 'csv' ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy CSV</>}
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 14,
          }}>
            <thead>
              <tr>
                {rows[0]?.map((_, colIdx) => (
                  <th key={colIdx} style={{
                    padding: '8px 12px',
                    borderBottom: '2px solid var(--border)',
                    textAlign: 'left',
                    background: 'var(--bg-secondary)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input
                        value={rows[0][colIdx]}
                        onChange={(e) => updateCell(0, colIdx, e.target.value)}
                        style={{
                          flex: 1,
                          background: 'transparent',
                          border: 'none',
                          fontWeight: 700,
                          fontSize: 14,
                          color: 'var(--text-primary)',
                          outline: 'none',
                          padding: 0,
                        }}
                      />
                      <button
                        onClick={() => removeColumn(colIdx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          fontSize: 16,
                          padding: '0 2px',
                          lineHeight: 1,
                        }}
                        title="Remove column"
                      >×</button>
                    </div>
                  </th>
                ))}
                <th style={{ width: 40 }} />
              </tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, rowIdx) => (
                <tr key={rowIdx + 1}>
                  {row.map((cell, colIdx) => (
                    <td key={colIdx} style={{
                      padding: '6px 12px',
                      borderBottom: '1px solid var(--border)',
                    }}>
                      <input
                        value={cell}
                        onChange={(e) => updateCell(rowIdx + 1, colIdx, e.target.value)}
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          fontSize: 14,
                          color: 'var(--text-primary)',
                          outline: 'none',
                          padding: 0,
                        }}
                      />
                    </td>
                  ))}
                  <td style={{ width: 40, textAlign: 'center' }}>
                    <button
                      onClick={() => removeRow(rowIdx + 1)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: 16,
                      }}
                      title="Remove row"
                    >×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 16,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
          Markdown Preview
        </div>
        <pre style={{
          margin: 0,
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: 13,
          lineHeight: 1.6,
          color: 'var(--text-primary)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>{markdown}</pre>
      </div>
    </ToolLayout>
  )
}
