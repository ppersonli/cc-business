'use client'
import { useState, useMemo, useCallback } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('color-palette')!

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function generateHarmony(baseHex: string, scheme: string): string[] {
  const [h, s, l] = hexToHsl(baseHex)

  switch (scheme) {
    case 'complementary':
      return [baseHex, hslToHex((h + 180) % 360, s, l)]
    case 'triadic':
      return [baseHex, hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l)]
    case 'analogous':
      return [hslToHex((h - 30 + 360) % 360, s, l), baseHex, hslToHex((h + 30) % 360, s, l)]
    case 'split-complementary':
      return [baseHex, hslToHex((h + 150) % 360, s, l), hslToHex((h + 210) % 360, s, l)]
    case 'tetradic':
      return [baseHex, hslToHex((h + 90) % 360, s, l), hslToHex((h + 180) % 360, s, l), hslToHex((h + 270) % 360, s, l)]
    case 'monochromatic':
      return [hslToHex(h, s, Math.max(l - 30, 5)), hslToHex(h, s, Math.max(l - 15, 5)), baseHex, hslToHex(h, s, Math.min(l + 15, 95)), hslToHex(h, s, Math.min(l + 30, 95))]
    default:
      return [baseHex]
  }
}

const SCHEMES = ['complementary', 'triadic', 'analogous', 'split-complementary', 'tetradic', 'monochromatic'] as const

export default function ColorPalette() {
  const [baseColor, setBaseColor] = useState('#3b82f6')
  const [scheme, setScheme] = useState<'complementary' | 'triadic' | 'analogous' | 'split-complementary' | 'tetradic' | 'monochromatic'>('complementary')
  const [copied, setCopied] = useState<string | null>(null)

  const palette = useMemo(() => generateHarmony(baseColor, scheme), [baseColor, scheme])

  const copyColor = useCallback((color: string) => {
    navigator.clipboard.writeText(color)
    setCopied(color)
    setTimeout(() => setCopied(null), 1500)
  }, [])

  const copyAll = useCallback(() => {
    navigator.clipboard.writeText(palette.join('\n'))
    setCopied('all')
    setTimeout(() => setCopied(null), 1500)
  }, [palette])

  return (
    <ToolLayout tool={tool}>
      <div className="options-row" style={{ flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <div className="option-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Base Color:</label>
          <input
            type="color"
            value={baseColor}
            onChange={(e) => setBaseColor(e.target.value)}
            style={{ width: 40, height: 32, padding: 0, border: 'none', borderRadius: 6, cursor: 'pointer' }}
          />
          <input
            type="text"
            value={baseColor}
            onChange={(e) => /^#[0-9a-f]{6}$/i.test(e.target.value) && setBaseColor(e.target.value)}
            style={{ width: 80, padding: '6px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 13 }}
          />
        </div>
        <button className="btn btn-sm" onClick={copyAll}>
          {copied === 'all' ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy All</>}
        </button>
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {SCHEMES.map(s => (
          <button
            key={s}
            className="btn btn-sm"
            onClick={() => setScheme(s)}
            style={{
              background: scheme === s ? 'var(--accent)' : 'var(--bg-secondary)',
              color: scheme === s ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${scheme === s ? 'var(--accent)' : 'var(--border)'}`,
              textTransform: 'capitalize',
            }}
          >
            {s.replace('-', ' ')}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
        {palette.map((color, i) => {
          const [h, s, l] = hexToHsl(color)
          return (
            <div
              key={i}
              style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', cursor: 'pointer' }}
              onClick={() => copyColor(color)}
            >
              <div style={{ height: 100, background: color }} />
              <div style={{ padding: '10px 12px', background: 'var(--bg-secondary)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                  {copied === color ? 'Copied!' : color.toUpperCase()}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  HSL({h}, {s}%, {l}%)
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </ToolLayout>
  )
}
