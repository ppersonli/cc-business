'use client'
import { useState } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('css-grid')!

interface GridPreset {
  name: string
  columns: string
  rows: string
  areas: string[][]
  areasEnabled: boolean
}

const presets: GridPreset[] = [
  {
    name: 'Holy Grail',
    columns: '200px 1fr 200px',
    rows: 'auto 1fr auto',
    areas: [
      ['header', 'header', 'header'],
      ['sidebar', 'main', 'aside'],
      ['footer', 'footer', 'footer'],
    ],
    areasEnabled: true,
  },
  {
    name: 'Sidebar',
    columns: '250px 1fr',
    rows: 'auto 1fr',
    areas: [
      ['nav', 'header'],
      ['nav', 'main'],
    ],
    areasEnabled: true,
  },
  {
    name: 'Dashboard',
    columns: '1fr 1fr 1fr 1fr',
    rows: 'auto auto auto',
    areas: [
      ['nav', 'nav', 'nav', 'nav'],
      ['chart1', 'chart1', 'chart2', 'chart2'],
      ['table', 'table', 'table', 'table'],
    ],
    areasEnabled: true,
  },
  {
    name: 'Gallery',
    columns: 'repeat(3, 1fr)',
    rows: 'repeat(3, 200px)',
    areas: [
      ['a', 'b', 'c'],
      ['d', 'd', 'e'],
      ['f', 'g', 'g'],
    ],
    areasEnabled: false,
  },
  {
    name: 'Blog',
    columns: '1fr 700px 1fr',
    rows: 'auto 1fr auto',
    areas: [
      ['. . .', '. . .', '. . .'],
      ['. content .', '. content .', '. content .'],
      ['. . .', '. . .', '. . .'],
    ],
    areasEnabled: false,
  },
  {
    name: 'Card Grid',
    columns: 'repeat(auto-fill, minmax(250px, 1fr))',
    rows: 'auto',
    areas: [],
    areasEnabled: false,
  },
]

const areaColors = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
  '#f97316', '#14b8a6', '#e11d48', '#6366f1',
]

const defaultAreas: string[][] = [
  ['header', 'header', 'header'],
  ['sidebar', 'main', 'main'],
  ['footer', 'footer', 'footer'],
]

export default function CSSGridGenerator() {
  const [columns, setColumns] = useState('1fr 2fr 1fr')
  const [rows, setRows] = useState('auto 1fr auto')
  const [columnGap, setColumnGap] = useState(16)
  const [rowGap, setRowGap] = useState(16)
  const [areasEnabled, setAreasEnabled] = useState(true)
  const [areas, setAreas] = useState<string[][]>(defaultAreas)
  const [previewWidth, setPreviewWidth] = useState<number>(0) // 0 = full
  const [copied, setCopied] = useState(false)

  const areaNames = Array.from(new Set(areas.flat())).filter(a => a && a !== '.')

  const areaMap = new Map<string, string>()
  areaNames.forEach((name, i) => {
    areaMap.set(name, areaColors[i % areaColors.length])
  })

  const colCount = columns.trim().split(/\s+/).length
  const rowCount = rows.trim().split(/\s+/).length

  const updateAreaCell = (rowIdx: number, colIdx: number, value: string) => {
    setAreas(prev => {
      const next = prev.map(r => [...r])
      next[rowIdx][colIdx] = value
      return next
    })
  }

  const addRow = () => {
    setRows(prev => prev + ' auto')
    setAreas(prev => {
      const cols = prev[0]?.length || colCount
      return [...prev, Array.from({ length: cols }, () => '.')]
    })
  }

  const removeRow = () => {
    if (rowCount <= 1) return
    setRows(prev => {
      const parts = prev.trim().split(/\s+/)
      return parts.slice(0, -1).join(' ')
    })
    setAreas(prev => prev.slice(0, -1))
  }

  const addColumn = () => {
    setColumns(prev => prev + ' 1fr')
    setAreas(prev => prev.map(row => [...row, '.']))
  }

  const removeColumn = () => {
    if (colCount <= 1) return
    setColumns(prev => {
      const parts = prev.trim().split(/\s+/)
      return parts.slice(0, -1).join(' ')
    })
    setAreas(prev => prev.map(row => row.slice(0, -1)))
  }

  const loadPreset = (preset: GridPreset) => {
    setColumns(preset.columns)
    setRows(preset.rows)
    setAreasEnabled(preset.areasEnabled)
    if (preset.areas.length > 0) {
      setAreas(preset.areas)
    }
  }

  const areasCSS = areas.map(row => `"${row.join(' ')}"`).join('\n    ')

  const cssCode = `.container {
  display: grid;
  grid-template-columns: ${columns};
  grid-template-rows: ${rows};
  gap: ${rowGap}px ${columnGap};${areasEnabled && areaNames.length > 0 ? `\n  grid-template-areas:\n    ${areasCSS};` : ''}
}`

  const itemCSS = areaNames.map(name => `.${name} {
  grid-area: ${name};
}`).join('\n\n')

  const fullCSS = areaNames.length > 0 && areasEnabled
    ? `${cssCode}\n\n${itemCSS}`
    : cssCode

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullCSS)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const gridContainerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: columns,
    gridTemplateRows: rows,
    columnGap,
    rowGap,
    gridTemplateAreas: areasEnabled && areaNames.length > 0
      ? areas.map(row => `"${row.join(' ')}"`).join(' ')
      : undefined,
    minHeight: 240,
    padding: 16,
    borderRadius: 12,
    border: '2px dashed var(--border)',
    background: 'var(--bg-secondary)',
    ...(previewWidth > 0 ? { maxWidth: previewWidth, margin: '0 auto', width: '100%' } : {}),
  }

  return (
    <ToolLayout tool={tool}>
      <div className="css-grid-layout" style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24 }}>
        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Columns */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
              grid-template-columns
            </label>
            <input
              type="text"
              value={columns}
              onChange={e => setColumns(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'monospace' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <button className="btn btn-sm" onClick={addColumn}>+ Column</button>
              <button className="btn btn-sm" onClick={removeColumn}>- Column</button>
            </div>
          </div>

          {/* Rows */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
              grid-template-rows
            </label>
            <input
              type="text"
              value={rows}
              onChange={e => setRows(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'monospace' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <button className="btn btn-sm" onClick={addRow}>+ Row</button>
              <button className="btn btn-sm" onClick={removeRow}>- Row</button>
            </div>
          </div>

          {/* Gap controls */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
              column-gap: {columnGap}px
            </label>
            <input type="range" min={0} max={50} value={columnGap} onChange={e => setColumnGap(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
              row-gap: {rowGap}px
            </label>
            <input type="range" min={0} max={50} value={rowGap} onChange={e => setRowGap(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>

          {/* Area toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              id="areas-toggle"
              checked={areasEnabled}
              onChange={e => setAreasEnabled(e.target.checked)}
              style={{ accentColor: 'var(--accent)' }}
            />
            <label htmlFor="areas-toggle" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}>
              Enable grid-template-areas
            </label>
          </div>

          {/* Presets */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Presets</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {presets.map(p => (
                <button key={p.name} className="btn btn-sm" onClick={() => loadPreset(p)}>{p.name}</button>
              ))}
            </div>
          </div>

          {/* Preview width */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Responsive Preview</label>
            <div className="options-row" style={{ display: 'flex', gap: 6 }}>
              {[
                { label: 'Full', w: 0 },
                { label: 'Desktop', w: 1200 },
                { label: 'Tablet', w: 768 },
                { label: 'Mobile', w: 375 },
              ].map(opt => (
                <button
                  key={opt.label}
                  className={`btn btn-sm ${previewWidth === opt.w ? 'btn-primary' : ''}`}
                  onClick={() => setPreviewWidth(opt.w)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Area names legend */}
          {areasEnabled && areaNames.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {areaNames.map(name => (
                <span key={name} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                  background: `${areaMap.get(name)}20`, color: areaMap.get(name),
                  border: `1px solid ${areaMap.get(name)}40`,
                }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: areaMap.get(name) }} />
                  {name}
                </span>
              ))}
            </div>
          )}

          {/* Area editor */}
          {areasEnabled && (
            <div className="tool-panel">
              <div className="panel-header">
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Grid Areas Editor</span>
              </div>
              <div className="panel-body">
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${colCount}, 1fr)`,
                  gap: 4,
                }}>
                  {areas.map((row, ri) =>
                    row.map((cell, ci) => (
                      <input
                        key={`${ri}-${ci}`}
                        type="text"
                        value={cell}
                        onChange={e => updateAreaCell(ri, ci, e.target.value || '.')}
                        style={{
                          padding: '6px 8px',
                          borderRadius: 6,
                          border: `2px solid ${cell && cell !== '.' ? (areaMap.get(cell) || 'var(--border)') : 'var(--border)'}`,
                          background: cell && cell !== '.' ? `${areaMap.get(cell)}15` : 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontSize: 12,
                          fontFamily: 'monospace',
                          textAlign: 'center',
                          textTransform: 'lowercase',
                        }}
                      />
                    ))
                  )}
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                  Type area names in cells. Use <code>.</code> for empty cells.
                </div>
              </div>
            </div>
          )}

          {/* Live preview */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Live Preview
            </div>
            <div style={gridContainerStyle}>
              {areasEnabled && areaNames.length > 0
                ? areaNames.map(name => (
                    <div
                      key={name}
                      style={{
                        gridArea: name,
                        background: `${areaMap.get(name)}30`,
                        border: `2px solid ${areaMap.get(name)}`,
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 13,
                        color: areaMap.get(name),
                        minHeight: 40,
                      }}
                    >
                      {name}
                    </div>
                  ))
                : Array.from({ length: Math.max(colCount * rowCount, 1) }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        background: `${areaColors[i % areaColors.length]}30`,
                        border: `2px solid ${areaColors[i % areaColors.length]}`,
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 13,
                        color: areaColors[i % areaColors.length],
                        minHeight: 40,
                      }}
                    >
                      {i + 1}
                    </div>
                  ))
              }
            </div>
          </div>

          {/* CSS output */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', justifyContent: 'space-between', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>CSS Output</span>
              <button
                onClick={handleCopy}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 12px', borderRadius: 6,
                  border: '1px solid var(--border)', background: 'transparent',
                  color: copied ? '#22c55e' : 'var(--text-secondary)',
                  cursor: 'pointer', fontSize: 12, textTransform: 'none', letterSpacing: '0', fontWeight: 500,
                }}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre style={{
              padding: 16,
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontFamily: 'Menlo, Monaco, "Courier New", monospace',
              fontSize: 13,
              lineHeight: 1.6,
              overflow: 'auto',
              margin: 0,
              whiteSpace: 'pre-wrap',
            }}>
              {fullCSS}
            </pre>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .css-grid-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </ToolLayout>
  )
}
