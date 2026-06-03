'use client'
import { useState, useCallback } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('box-shadow')!

const presets = [
  { name: 'Soft', h: 0, v: 4, blur: 20, spread: 0, color: '#00000033', inset: false },
  { name: 'Hard', h: 4, v: 4, blur: 0, spread: 0, color: '#00000055', inset: false },
  { name: 'Glow', h: 0, v: 0, blur: 30, spread: 0, color: '#3b82f666', inset: false },
  { name: 'Deep', h: 10, v: 10, blur: 30, spread: -5, color: '#00000040', inset: false },
  { name: 'Inset', h: 0, v: 4, blur: 10, spread: 0, color: '#00000033', inset: true },
  { name: 'Neon', h: 0, v: 0, blur: 15, spread: 5, color: '#22c55e88', inset: false },
  { name: 'Floating', h: 0, v: 20, blur: 60, spread: -15, color: '#00000025', inset: false },
  { name: 'Emboss', h: 2, v: 2, blur: 5, spread: 0, color: '#ffffff20', inset: true },
]

export default function BoxShadow() {
  const [h, setH] = useState(0)
  const [v, setV] = useState(4)
  const [blur, setBlur] = useState(20)
  const [spread, setSpread] = useState(0)
  const [color, setColor] = useState('#000000')
  const [opacity, setOpacity] = useState(20)
  const [inset, setInset] = useState(false)
  const [copied, setCopied] = useState(false)

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha / 100})`
  }

  const shadowColor = hexToRgba(color, opacity)
  const shadowCSS = `${inset ? 'inset ' : ''}${h}px ${v}px ${blur}px ${spread}px ${shadowColor}`
  const cssCode = `box-shadow: ${shadowCSS};`

  const loadPreset = (preset: typeof presets[0]) => {
    setH(preset.h)
    setV(preset.v)
    setBlur(preset.blur)
    setSpread(preset.spread)
    setColor(preset.color.slice(0, 7))
    setOpacity(Math.round(parseInt(preset.color.slice(7), 16) / 255 * 100))
    setInset(preset.inset)
  }

  const copyCSS = async () => {
    await navigator.clipboard.writeText(cssCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const controls = [
    { label: 'Horizontal', value: h, set: setH, min: -100, max: 100 },
    { label: 'Vertical', value: v, set: setV, min: -100, max: 100 },
    { label: 'Blur', value: blur, set: setBlur, min: 0, max: 200 },
    { label: 'Spread', value: spread, set: setSpread, min: -100, max: 100 },
    { label: 'Opacity', value: opacity, set: setOpacity, min: 0, max: 100 },
  ]

  return (
    <ToolLayout tool={tool}>
      <div style={{ display: 'grid', gap: 24, maxWidth: 900 }}>
        {/* Preview */}
        <div className="tool-panel">
          <div className="panel-body" style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div style={{
              width: 200,
              height: 200,
              borderRadius: 16,
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              boxShadow: shadowCSS,
              transition: 'box-shadow 0.15s',
            }} />
          </div>
        </div>

        {/* Controls */}
        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Shadow Properties</span>
            <button
              className={`btn btn-sm ${inset ? 'btn-primary' : ''}`}
              onClick={() => setInset(!inset)}
            >
              Inset
            </button>
          </div>
          <div className="panel-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {controls.map(c => (
                <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <label style={{ fontSize: 13, color: 'var(--text-muted)', width: 80, flexShrink: 0 }}>{c.label}</label>
                  <input
                    type="range"
                    min={c.min}
                    max={c.max}
                    value={c.value}
                    onChange={e => c.set(Number(e.target.value))}
                    style={{ flex: 1, accentColor: 'var(--accent)' }}
                  />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 50, textAlign: 'right', fontFamily: 'monospace' }}>{c.value}px</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <label style={{ fontSize: 13, color: 'var(--text-muted)', width: 80, flexShrink: 0 }}>Color</label>
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                style={{ width: 40, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 0 }}
              />
              <input
                type="text"
                value={color}
                onChange={e => {
                  if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) setColor(e.target.value)
                }}
                style={{ width: 100, fontFamily: 'monospace', fontSize: 13, padding: '6px 10px' }}
              />
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
                <button key={p.name} className="btn btn-sm" onClick={() => loadPreset(p)}>
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
