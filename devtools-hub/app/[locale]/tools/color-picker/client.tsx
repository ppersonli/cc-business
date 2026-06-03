'use client'
import { useState, useCallback } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('color-picker')!

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = hex.replace('#', '').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (!match) return null
  return { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16) }
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360; s /= 100; l /= 100
  let r: number, g: number, b: number

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }

  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}

export default function ColorPicker() {
  const [color, setColor] = useState('#3b82f6')
  const [copied, setCopied] = useState('')

  const rgb = hexToRgb(color) || { r: 0, g: 0, b: 0 }
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)

  const formats = [
    { label: 'HEX', value: color.toUpperCase() },
    { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: 'CSS', value: `background-color: ${color};` },
  ]

  const copyValue = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value)
    setCopied(label)
    setTimeout(() => setCopied(''), 1500)
  }

  // Generate color harmonies
  const complementary = rgbToHex(...Object.values(hslToRgb((hsl.h + 180) % 360, hsl.s, hsl.l)) as [number, number, number])
  const analogous1 = rgbToHex(...Object.values(hslToRgb((hsl.h + 30) % 360, hsl.s, hsl.l)) as [number, number, number])
  const analogous2 = rgbToHex(...Object.values(hslToRgb((hsl.h + 330) % 360, hsl.s, hsl.l)) as [number, number, number])
  const triadic1 = rgbToHex(...Object.values(hslToRgb((hsl.h + 120) % 360, hsl.s, hsl.l)) as [number, number, number])
  const triadic2 = rgbToHex(...Object.values(hslToRgb((hsl.h + 240) % 360, hsl.s, hsl.l)) as [number, number, number])

  const harmonies = [
    { label: 'Complementary', colors: [complementary] },
    { label: 'Analogous', colors: [analogous1, analogous2] },
    { label: 'Triadic', colors: [triadic1, triadic2] },
  ]

  return (
    <ToolLayout tool={tool}>
      <div style={{ display: 'grid', gap: 24, maxWidth: 800 }}>
        {/* Main color picker */}
        <div className="tool-panel">
          <div className="panel-body" style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                style={{
                  width: 200,
                  height: 200,
                  border: 'none',
                  borderRadius: 12,
                  cursor: 'pointer',
                  padding: 0,
                  background: 'none',
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                  HEX Value
                </label>
                <input
                  type="text"
                  value={color}
                  onChange={e => {
                    const val = e.target.value
                    if (/^#[0-9a-fA-F]{6}$/.test(val)) setColor(val)
                  }}
                  style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 600 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>R</label>
                  <input
                    type="number"
                    min={0} max={255}
                    value={rgb.r}
                    onChange={e => {
                      const r = Math.min(255, Math.max(0, parseInt(e.target.value) || 0))
                      setColor(rgbToHex(r, rgb.g, rgb.b))
                    }}
                    style={{ fontSize: 14, padding: '6px 10px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>G</label>
                  <input
                    type="number"
                    min={0} max={255}
                    value={rgb.g}
                    onChange={e => {
                      const g = Math.min(255, Math.max(0, parseInt(e.target.value) || 0))
                      setColor(rgbToHex(rgb.r, g, rgb.b))
                    }}
                    style={{ fontSize: 14, padding: '6px 10px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>B</label>
                  <input
                    type="number"
                    min={0} max={255}
                    value={rgb.b}
                    onChange={e => {
                      const b = Math.min(255, Math.max(0, parseInt(e.target.value) || 0))
                      setColor(rgbToHex(rgb.r, rgb.g, b))
                    }}
                    style={{ fontSize: 14, padding: '6px 10px' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Color preview & format codes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="tool-panel">
            <div className="panel-header">
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Preview</span>
            </div>
            <div className="panel-body">
              <div
                className="color-swatch"
                style={{ background: color, marginBottom: 12 }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ height: 40, borderRadius: 6, background: color }} />
                <div style={{ height: 40, borderRadius: 6, background: `${color}88` }} />
                <div style={{ height: 40, borderRadius: 6, background: `${color}44` }} />
                <div style={{ height: 40, borderRadius: 6, background: `${color}22`, border: '1px solid var(--border)' }} />
              </div>
            </div>
          </div>

          <div className="tool-panel">
            <div className="panel-header">
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Color Codes</span>
            </div>
            <div className="panel-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {formats.map(f => (
                  <div key={f.label} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'var(--bg-primary)',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                  }}>
                    <div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{f.label}</span>
                      <div style={{ fontSize: 13, fontFamily: 'monospace', marginTop: 2 }}>{f.value}</div>
                    </div>
                    <button className="btn btn-sm" onClick={() => copyValue(f.value, f.label)}>
                      {copied === f.label ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Color harmonies */}
        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Color Harmonies</span>
          </div>
          <div className="panel-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {harmonies.map(h => (
                <div key={h.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', width: 100 }}>{h.label}</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div
                      style={{
                        width: 40, height: 40, borderRadius: 8,
                        background: color, border: '2px solid var(--border)',
                        cursor: 'pointer',
                      }}
                      onClick={() => copyValue(color, `${h.label}-base`)}
                      title="Base color"
                    />
                    {h.colors.map((c, i) => (
                      <div
                        key={i}
                        style={{
                          width: 40, height: 40, borderRadius: 8,
                          background: c, border: '2px solid var(--border)',
                          cursor: 'pointer',
                        }}
                        onClick={() => copyValue(c, `${h.label}-${i}`)}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
