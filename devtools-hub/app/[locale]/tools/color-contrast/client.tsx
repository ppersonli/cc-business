'use client'
import { useState, useMemo } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'

const tool = getToolBySlug('color-contrast')!

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(hexToRgb(fg))
  const l2 = relativeLuminance(hexToRgb(bg))
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function getWcagLevel(ratio: number, size: 'normal' | 'large') {
  const thresholds = size === 'large'
    ? { AAA: 4.5, AA: 3, fail: 0 }
    : { AAA: 7, AA: 4.5, fail: 0 }

  if (ratio >= thresholds.AAA) return { level: 'AAA', color: '#16a34a', desc: 'Excellent' }
  if (ratio >= thresholds.AA) return { level: 'AA', color: '#e6a23c', desc: 'Good' }
  return { level: 'Fail', color: '#ef4444', desc: 'Insufficient' }
}

export default function ColorContrastChecker() {
  const [fg, setFg] = useState('#333333')
  const [bg, setBg] = useState('#ffffff')
  const [copied, setCopied] = useState(false)

  const ratio = useMemo(() => contrastRatio(fg, bg), [fg, bg])
  const normalText = useMemo(() => getWcagLevel(ratio, 'normal'), [ratio])
  const largeText = useMemo(() => getWcagLevel(ratio, 'large'), [ratio])

  const swap = () => { setFg(bg); setBg(fg) }

  const copyCSS = () => {
    navigator.clipboard.writeText(`color: ${fg};\nbackground-color: ${bg};\n/* Contrast ratio: ${ratio.toFixed(2)}:1 */`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolLayout tool={tool}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '24px 16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', marginBottom: '24px' }}>
          Color Contrast Checker
        </h1>

        {/* Color Pickers */}
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#64748b' }}>Text Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} style={{ width: '48px', height: '48px', border: '2px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', padding: '2px' }} />
              <input type="text" value={fg} onChange={(e) => { if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) setFg(e.target.value) }}
                style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', fontFamily: 'monospace', width: '90px' }} />
            </div>
          </div>
          <button onClick={swap} style={{ alignSelf: 'flex-end', padding: '8px 16px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }} title="Swap colors">
            🔄
          </button>
          <div style={{ textAlign: 'center' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#64748b' }}>Background</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} style={{ width: '48px', height: '48px', border: '2px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', padding: '2px' }} />
              <input type="text" value={bg} onChange={(e) => { if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) setBg(e.target.value) }}
                style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', fontFamily: 'monospace', width: '90px' }} />
            </div>
          </div>
        </div>

        {/* Ratio Display */}
        <div style={{ textAlign: 'center', padding: '24px', backgroundColor: '#f8fafc', borderRadius: '16px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '48px', fontWeight: 800, color: ratio >= 4.5 ? '#16a34a' : ratio >= 3 ? '#e6a23c' : '#ef4444' }}>
            {ratio.toFixed(2)}:1
          </div>
          <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Contrast Ratio</div>
        </div>

        {/* WCAG Results */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Normal Text', ...normalText, size: '16px regular' },
            { label: 'Large Text', ...largeText, size: '18px bold or 24px regular' },
          ].map((item) => (
            <div key={item.label} style={{ padding: '16px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>{item.label}</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: item.color, marginBottom: '4px' }}>{item.level}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{item.label === 'Normal Text' ? '16px regular' : '18px bold / 24px'}</div>
              <div style={{ fontSize: '12px', color: item.color, marginTop: '4px' }}>{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Preview */}
        <div style={{ padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '12px' }}>Preview</div>
          <div style={{ padding: '16px', backgroundColor: bg, borderRadius: '8px' }}>
            <h2 style={{ color: fg, margin: '0 0 8px', fontSize: '20px' }}>Heading Text</h2>
            <p style={{ color: fg, margin: '0 0 8px', fontSize: '16px' }}>This is normal body text to preview contrast.</p>
            <p style={{ color: fg, margin: 0, fontSize: '12px' }}>Small text like captions and labels.</p>
          </div>
        </div>

        {/* Copy CSS */}
        <div style={{ textAlign: 'center' }}>
          <button onClick={copyCSS} style={{ padding: '10px 24px', backgroundColor: '#3b82f6', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            {copied ? '✓ Copied!' : 'Copy CSS'}
          </button>
        </div>
      </div>
    </ToolLayout>
  )
}
