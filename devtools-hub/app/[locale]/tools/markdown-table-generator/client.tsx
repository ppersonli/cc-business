'use client'
import { useState, useCallback, useMemo } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('markdown-table-generator')!

interface TableCell {
  value: string
}

interface TableData {
  headers: string[]
  rows: string[][]
}

const SAMPLE_TABLE = `| Name | Age | City |
| --- | --- | --- |
| Alice | 30 | NYC |
| Bob | 25 | LA |
| Charlie | 35 | Chicago |`

function parseMarkdownTable(md: string): TableData | null {
  const lines = md.trim().split('\n').filter(l => l.trim())
  if (lines.length < 2) return null

  const parseRow = (line: string): string[] =>
    line
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map(cell => cell.trim())

  const headers = parseRow(lines[0])

  const separatorIdx = lines.findIndex(l => /^\|?\s*[-:]+[-|:\s]*$/.test(l.trim()))
  if (separatorIdx < 0) return null

  const rows = lines.slice(separatorIdx + 1).map(parseRow)

  return { headers, rows }
}

function tableDataToMarkdown(data: TableData): string {
  const colWidths = data.headers.map((h, i) => {
    const rowWidths = data.rows.map(r => (r[i] || '').length)
    return Math.max(h.length, ...rowWidths, 3)
  })

  const pad = (s: string, w: number) => s + ' '.repeat(Math.max(0, w - s.length))

  const headerLine = '| ' + data.headers.map((h, i) => pad(h, colWidths[i])).join(' | ') + ' |'
  const sepLine = '| ' + colWidths.map(w => '-'.repeat(w)).join(' | ') + ' |'
  const rowLines = data.rows.map(
    row => '| ' + row.map((c, i) => pad(c || '', colWidths[i])).join(' | ') + ' |'
  )

  return [headerLine, sepLine, ...rowLines].join('\n')
}

function tableDataToHTML(data: TableData): string {
  const ths = data.headers.map(h => `  <th>${escapeHtml(h)}</th>`).join('\n')
  const trs = data.rows
    .map(row => `  <tr>\n${row.map(c => `    <td>${escapeHtml(c)}</td>`).join('\n')}\n  </tr>`)
    .join('\n')
  return `<table>\n  <thead>\n  <tr>\n${ths}\n  </tr>\n  </thead>\n  <tbody>\n${trs}\n  </tbody>\n</table>`
}

function tableDataToCSV(data: TableData): string {
  const escape = (s: string) => (s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s)
  const headerLine = data.headers.map(escape).join(',')
  const rowLines = data.rows.map(row => row.map(escape).join(','))
  return [headerLine, ...rowLines].join('\n')
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function createEmptyTable(cols: number, rows: number): TableData {
  return {
    headers: Array.from({ length: cols }, (_, i) => `Col ${i + 1}`),
    rows: Array.from({ length: rows }, () => Array.from({ length: cols }, () => '')),
  }
}

export default function MarkdownTableGenerator() {
  const [input, setInput] = useState(SAMPLE_TABLE)
  const [copied, setCopied] = useState<string | null>(null)

  const parsed = useMemo(() => parseMarkdownTable(input), [input])

  const handleCopy = useCallback(
    async (format: 'markdown' | 'html' | 'csv') => {
      if (!parsed) return
      const text =
        format === 'markdown' ? tableDataToMarkdown(parsed) :
        format === 'html' ? tableDataToHTML(parsed) :
        tableDataToCSV(parsed)
      await navigator.clipboard.writeText(text)
      setCopied(format)
      setTimeout(() => setCopied(null), 2000)
    },
    [parsed]
  )

  const addRow = useCallback(() => {
    if (!parsed) return
    const newRow = Array.from({ length: parsed.headers.length }, () => '')
    setInput(tableDataToMarkdown({ ...parsed, rows: [...parsed.rows, newRow] }))
  }, [parsed])

  const addColumn = useCallback(() => {
    if (!parsed) return
    setInput(
      tableDataToMarkdown({
        headers: [...parsed.headers, `Col ${parsed.headers.length + 1}`],
        rows: parsed.rows.map(row => [...row, '']),
      })
    )
  }, [parsed])

  const removeLastRow = useCallback(() => {
    if (!parsed || parsed.rows.length <= 1) return
    setInput(tableDataToMarkdown({ ...parsed, rows: parsed.rows.slice(0, -1) }))
  }, [parsed])

  const removeLastColumn = useCallback(() => {
    if (!parsed || parsed.headers.length <= 1) return
    setInput(
      tableDataToMarkdown({
        headers: parsed.headers.slice(0, -1),
        rows: parsed.rows.map(row => row.slice(0, -1)),
      })
    )
  }, [parsed])

  const updateCell = useCallback(
    (type: 'header' | 'cell', rowIdx: number, colIdx: number, value: string) => {
      if (!parsed) return
      const next = { headers: [...parsed.headers], rows: parsed.rows.map(r => [...r]) }
      if (type === 'header') next.headers[colIdx] = value
      else next.rows[rowIdx][colIdx] = value
      setInput(tableDataToMarkdown(next))
    },
    [parsed]
  )

  const loadSample = useCallback(() => setInput(SAMPLE_TABLE), [])
  const clearInput = useCallback(() => setInput(''), [])

  return (
    <ToolLayout tool={tool}>
      <div style={{ display: 'grid', gap: 24, maxWidth: 960 }}>
        {/* Input area */}
        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
              Markdown Input
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-sm" onClick={loadSample}>Sample</button>
              <button className="btn btn-sm" onClick={clearInput}>Clear</button>
            </div>
          </div>
          <div className="panel-body">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={'| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1   | Cell 2   |'}
              style={{
                width: '100%',
                minHeight: 140,
                padding: 14,
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text-primary)',
                fontSize: 14,
                fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                lineHeight: 1.6,
                resize: 'vertical',
              }}
            />
          </div>
        </div>

        {/* Row/Column controls */}
        {parsed && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button className="btn btn-sm" onClick={addRow}>+ Row</button>
            <button className="btn btn-sm" onClick={removeLastRow}>- Row</button>
            <button className="btn btn-sm" onClick={addColumn}>+ Column</button>
            <button className="btn btn-sm" onClick={removeLastColumn}>- Column</button>
          </div>
        )}

        {/* Visual editor */}
        {parsed && (
          <div className="tool-panel">
            <div className="panel-header">
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Visual Editor
              </span>
            </div>
            <div className="panel-body" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr>
                    {parsed.headers.map((h, ci) => (
                      <th key={ci} style={{ padding: 0, border: '1px solid var(--border)' }}>
                        <input
                          type="text"
                          value={h}
                          onChange={e => updateCell('header', 0, ci, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            border: 'none',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            fontWeight: 600,
                            fontSize: 13,
                          }}
                        />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsed.rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci} style={{ padding: 0, border: '1px solid var(--border)' }}>
                          <input
                            type="text"
                            value={cell}
                            onChange={e => updateCell('cell', ri, ci, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              border: 'none',
                              background: 'var(--bg-primary)',
                              color: 'var(--text-primary)',
                              fontSize: 13,
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Live preview */}
        {parsed && (
          <div className="tool-panel">
            <div className="panel-header">
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Live Preview
              </span>
            </div>
            <div className="panel-body" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr>
                    {parsed.headers.map((h, i) => (
                      <th
                        key={i}
                        style={{
                          padding: '10px 14px',
                          textAlign: 'left',
                          borderBottom: '2px solid var(--accent)',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          background: 'var(--bg-secondary)',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsed.rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          style={{
                            padding: '10px 14px',
                            borderBottom: '1px solid var(--border)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Copy buttons */}
        {parsed && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {(['markdown', 'html', 'csv'] as const).map(fmt => (
              <button
                key={fmt}
                className={`btn ${copied === fmt ? 'btn-primary' : ''}`}
                onClick={() => handleCopy(fmt)}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {copied === fmt ? <CheckIcon /> : <CopyIcon />}
                Copy as {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!parsed && input.trim() === '' && (
          <div style={{
            padding: 40,
            textAlign: 'center',
            color: 'var(--text-muted)',
            border: '2px dashed var(--border)',
            borderRadius: 12,
          }}>
            <p style={{ fontSize: 15, marginBottom: 8 }}>Paste a Markdown table or CSV above to get started</p>
            <p style={{ fontSize: 13 }}>Or click <strong>Sample</strong> to load an example</p>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
