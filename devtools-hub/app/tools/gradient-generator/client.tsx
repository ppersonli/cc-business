'use client'
import { useState, useCallback } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('gradient-generator')!

type GradientType = 'linear' | 'radial' | 'conic'
type GradientUnit = 'deg' | 'turn'

interface GradientStop {
  color: string
  position: number
}

const presets = [
  { name: 'Sunset', stops: [{ color: '#ff512f', position: 0 }, { color: '#dd2476', position: 100 }] },
  { name: 'Ocean', stops: [{ color: '#2193b0', position: 0 }, { color: '#6dd5ed', position: 100 }] },
  { name: 'Peach', stops: [{ color: '#ed4264', position: 0 }, { color: '#ffedbc', position: 100 }] },
  { name: 'Midnight', stops: [{ color: '#232526', position: 0 }, { color: '#414345', position: 100 }] },
  { name: 'Lavender', stops: [{ color: '#7f7fd5', position: 0 }, { color: '#86a8e7', position: 50 }, { color: '#91eae4', position: 100 }] },
  { name: 'Forest', stops: [{ color: '#134e5e', position: 0 }, { color: '#71b280', position: 100 }] },
  { name: 'Flame', stops: [{ color: '#f12711', position: 0 }, { color: '#f5af19', position: 100 }] },
  { name: 'Royal', stops: [{ color: '#141e30', position: 0 }, { color: '#243b55', position: 100 }] },
  { name: 'Berry', stops: [{ color: '#ee0979', position: 0 }, { color: '#ff6a00', position: 100 }] },
  { name: 'Sky', stops: [{ color: '#2b5876', position: 0 }, { color: '#4e4376', position: 100 }] },
]

export default function GradientGenerator() {
  const [type, setType] = useState<GradientType>('linear')
  const [angle, setAngle] = useState(135)
  const [unit, setUnit] = useState<GradientUnit>('deg')
  const [stops, setStops] = useState<GradientStop[]>([
    { color: '#3b82f6', position: 0 },
    { color: '#8b5cf6', position: 100 },
  ])
  const [copied, setCopied] = useState(false)

  const updateStop = useCallback((index: number, field: keyof GradientStop, value: string | number) => {
    setStops(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
  }, [])

  const addStop = useCallback(() => {
    setStops(prev => [...prev, { color: '#10b981', position: 50 }])
  }, [])

  const removeStop = useCallback((index: number) => {
    if (stops.length <= 2) return
    setStops(prev => prev.filter((_, i) => i !== index))
  }, [stops.length])

  const sortedStops = [...stops].sort((a, b) => a.position - b.position)

  const gradientCSS = (() => {
    const stopsStr = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ')
    if (type === 'linear') return `linear-gradient(${angle}${unit}, ${stopsStr})`
    if (type === 'radial') return `radial-gradient(circle, ${stopsStr})`
    return `conic-gradient(from ${angle}${unit}, ${stopsStr})`
  })()

  const cssCode = `background: ${gradientCSS};`
  const linearCode = type === 'linear' ? gradientCSS : cssCode

  const copyCSS = async () => {
    await navigator.clipboard.writeText(cssCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const loadPreset = (preset: typeof presets[0]) => {
    setStops(preset.stops)
  }

  return (
    <ToolLayout tool={tool}>
      <div style={{ display: 'grid', gap: 24, maxWidth: 900 }}>
        {/* Preview */}
        <div className="tool-panel">
          <div className="panel-body">
            <div style={{
              width: '100%',
              height: 200,
              borderRadius: 12,
              background: gradientCSS,
              border: '1px solid var(--border)',
            }} />
          </div>
        </div>

        {/* Gradient type & angle */}
        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Type & Direction</span>
          </div>
          <div className="panel-body">
            <div className="options-row" style={{ marginBottom: 12 }}>
              {(['linear', 'radial', 'conic'] as GradientType[]).map(t => (
                <button
                  key={t}
                  className={`btn ${type === t ? 'btn-primary' : ''}`}
                  onClick={() => setType(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            {(type === 'linear' || type === 'conic') && (
              <div className="options-row">
                <div className="option-group">
                  <label>Angle</label>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={angle}
                    onChange={e => setAngle(Number(e.target.value))}
                    style={{ width: 200, accentColor: 'var(--accent)' }}
                  />
                  <input
                    type="number"
                    min={0}
                    max={360}
                    value={angle}
                    onChange={e => setAngle(Number(e.target.value))}
                    style={{ width: 70, fontSize: 13, padding: '4px 8px' }}
                  />
                </div>
                <select value={unit} onChange={e => setUnit(e.target.value as GradientUnit)}>
                  <option value="deg">Degrees</option>
                  <option value="turn">Turns</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Color stops */}
        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Color Stops</span>
            <button className="btn btn-sm" onClick={addStop}>+ Add Stop</button>
          </div>
          <div className="panel-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stops.map((stop, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 12px',
                  background: 'var(--bg-primary)',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                }}>
                  <input
                    type="color"
                    value={stop.color}
                    onChange={e => updateStop(i, 'color', e.target.value)}
                    style={{ width: 40, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 0 }}
                  />
                  <input
                    type="text"
                    value={stop.color}
                    onChange={e => {
                      if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) updateStop(i, 'color', e.target.value)
                    }}
                    style={{ width: 100, fontFamily: 'monospace', fontSize: 13, padding: '6px 10px' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={stop.position}
                      onChange={e => updateStop(i, 'position', Number(e.target.value))}
                      style={{ flex: 1, accentColor: 'var(--accent)' }}
                    />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 40, textAlign: 'right' }}>{stop.position}%</span>
                  </div>
                  {stops.length > 2 && (
                    <button
                      className="btn btn-sm"
                      onClick={() => removeStop(i)}
                      style={{ color: 'var(--error)', borderColor: 'rgba(239,68,68,0.3)' }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Presets */}
        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Presets</span>
          </div>
          <div className="panel-body">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {presets.map(p => (
                <button
                  key={p.name}
                  className="btn btn-sm"
                  onClick={() => loadPreset(p)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: `linear-gradient(135deg, ${p.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`,
                    border: '1px solid var(--border)',
                  }} />
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CSS output */}
        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>CSS Code</span>
            <button className="btn btn-sm btn-primary" onClick={copyCSS}>
              {copied ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
            </button>
          </div>
          <div className="panel-body">
            <pre style={{
              background: 'var(--bg-primary)',
              padding: 16,
              borderRadius: 8,
              border: '1px solid var(--border)',
              overflow: 'auto',
              margin: 0,
            }}>
              <code>{cssCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
