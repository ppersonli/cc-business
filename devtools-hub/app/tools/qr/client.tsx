'use client'
import { useState, useRef } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { QRCodeSVG } from 'qrcode.react'

const tool = getToolBySlug('qr')!

const PRESETS = [
  { label: 'URL', value: 'https://example.com' },
  { label: 'Email', value: 'mailto:hello@example.com' },
  { label: 'Phone', value: 'tel:+1234567890' },
  { label: 'WiFi', value: 'WIFI:T:WPA;S:MyNetwork;P:password123;;' },
]

export default function QRGenerator() {
  const [text, setText] = useState('https://devtoolshub.com')
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [size, setSize] = useState(256)
  const qrRef = useRef<HTMLDivElement>(null)

  const downloadSVG = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return
    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svg)
    const blob = new Blob([svgStr], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'qrcode.svg'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadPNG = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return
    const canvas = document.createElement('canvas')
    canvas.width = size * 2
    canvas.height = size * 2
    const ctx = canvas.getContext('2d')!
    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svg)
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size * 2, size * 2)
      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png')
      a.download = 'qrcode.png'
      a.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)))
  }

  return (
    <ToolLayout tool={tool}>
      <div style={{ marginBottom: 16 }}>
        <div className="options-row" style={{ marginBottom: 12 }}>
          {PRESETS.map(p => (
            <button key={p.label} className="btn btn-sm" onClick={() => setText(p.value)}>{p.label}</button>
          ))}
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Enter URL, text, email, phone, or WiFi config..."
          style={{ minHeight: 80 }}
          spellCheck={false}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'start' }}>
        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Options</span>
          </div>
          <div className="panel-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Foreground</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} style={{ width: 40, height: 36, padding: 2, cursor: 'pointer' }} />
                  <input type="text" value={fgColor} onChange={e => setFgColor(e.target.value)} style={{ flex: 1 }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Background</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: 40, height: 36, padding: 2, cursor: 'pointer' }} />
                  <input type="text" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ flex: 1 }} />
                </div>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Size: {size}px
              </label>
              <input
                type="range"
                min={128}
                max={512}
                step={32}
                value={size}
                onChange={e => setSize(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn btn-primary" onClick={downloadSVG}>Download SVG</button>
              <button className="btn" onClick={downloadPNG}>Download PNG</button>
            </div>
          </div>
        </div>

        <div ref={qrRef} style={{ background: bgColor, padding: 24, borderRadius: 12, display: 'inline-flex' }}>
          {text ? (
            <QRCodeSVG value={text} size={size} fgColor={fgColor} bgColor={bgColor} />
          ) : (
            <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              Enter text above
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
