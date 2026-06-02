'use client'
import { useState, useMemo } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('colors')!

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, Math.round(l * 100)]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100; l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
  }
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)]
}

function rgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
  if (r === 0 && g === 0 && b === 0) return [0, 0, 0, 100]
  const c = 1 - r / 255, m = 1 - g / 255, y = 1 - b / 255
  const k = Math.min(c, m, y)
  return [
    Math.round(((c - k) / (1 - k)) * 100),
    Math.round(((m - k) / (1 - k)) * 100),
    Math.round(((y - k) / (1 - k)) * 100),
    Math.round(k * 100),
  ]
}

type Format = 'hex' | 'rgb' | 'hsl' | 'cmyk'

export default function ColorConverter() {
  const [hex, setHex] = useState('#3b82f6')
  const [rgbStr, setRgbStr] = useState('59, 130, 246')
  const [hslStr, setHslStr] = useState('217, 91%, 60%')
  const [cmykStr, setCmykStr] = useState('76, 47, 0, 4')
  const [activeFormat, setActiveFormat] = useState<Format>('hex')
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const rgb = useMemo(() => hexToRgb(hex), [hex])
  const hsl = useMemo(() => rgb ? rgbToHsl(...rgb) : null, [rgb])
  const cmyk = useMemo(() => rgb ? rgbToCmyk(...rgb) : null, [rgb])

  const updateFromHex = (val: string) => {
    setHex(val)
    const r = hexToRgb(val)
    if (r) {
      setRgbStr(r.join(', '))
      const h = rgbToHsl(...r)
      setHslStr(`${h[0]}, ${h[1]}%, ${h[2]}%`)
      const c = rgbToCmyk(...r)
      setCmykStr(c.join(', '))
    }
  }

  const updateFromRgb = (val: string) => {
    setRgbStr(val)
    const parts = val.split(',').map(s => parseInt(s.trim()))
    if (parts.length === 3 && parts.every(n => !isNaN(n) && n >= 0 && n <= 255)) {
      const h = rgbToHex(...(parts as [number, number, number]))
      setHex(h)
      const hs = rgbToHsl(...(parts as [number, number, number]))
      setHslStr(`${hs[0]}, ${hs[1]}%, ${hs[2]}%`)
      const c = rgbToCmyk(...(parts as [number, number, number]))
      setCmykStr(c.join(', '))
    }
  }

  const updateFromHsl = (val: string) => {
    setHslStr(val)
    const m = val.match(/(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/)
    if (m) {
      const [h, s, l] = [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])]
      if (h <= 360 && s <= 100 && l <= 100) {
        const r = hslToRgb(h, s, l)
        const hexVal = rgbToHex(...r)
        setHex(hexVal)
        setRgbStr(r.join(', '))
        const c = rgbToCmyk(...r)
        setCmykStr(c.join(', '))
      }
    }
  }

  const copy = async (value: string, field: string) => {
    await navigator.clipboard.writeText(value)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 1500)
  }

  const CopyBtn = ({ value, field }: { value: string; field: string }) => (
    <button className="btn btn-sm" onClick={() => copy(value, field)}>
      {copiedField === field ? <><CheckIcon /></> : <><CopyIcon /></>}
    </button>
  )

  return (
    <ToolLayout tool={tool}>
      <div className="color-swatch" style={{ background: hex, marginBottom: 24 }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: '#f97316' }}>HEX</span>
            <CopyBtn value={hex} field="hex" />
          </div>
          <div className="panel-body">
            <input type="text" value={hex} onChange={e => updateFromHex(e.target.value)} />
          </div>
        </div>

        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: '#3b82f6' }}>RGB</span>
            <CopyBtn value={`rgb(${rgbStr})`} field="rgb" />
          </div>
          <div className="panel-body">
            <input type="text" value={rgbStr} onChange={e => updateFromRgb(e.target.value)} placeholder="R, G, B" />
          </div>
        </div>

        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: '#22c55e' }}>HSL</span>
            <CopyBtn value={`hsl(${hslStr})`} field="hsl" />
          </div>
          <div className="panel-body">
            <input type="text" value={hslStr} onChange={e => updateFromHsl(e.target.value)} placeholder="H, S%, L%" />
          </div>
        </div>

        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: '#ec4899' }}>CMYK</span>
            <CopyBtn value={`cmyk(${cmykStr})`} field="cmyk" />
          </div>
          <div className="panel-body">
            <input type="text" value={cmykStr} readOnly />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
        {['#ef4444','#f97316','#f59e0b','#22c55e','#3b82f6','#8b5cf6','#ec4899','#06b6d4','#ffffff','#000000'].map(c => (
          <button
            key={c}
            onClick={() => updateFromHex(c)}
            style={{
              width: 36, height: 36, borderRadius: 8, background: c,
              border: hex === c ? '3px solid var(--accent)' : '1px solid var(--border)',
              cursor: 'pointer',
            }}
            title={c}
          />
        ))}
      </div>
    </ToolLayout>
  )
}
