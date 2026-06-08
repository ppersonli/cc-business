'use client'
import { useState } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('css-flexbox')!

const displayOptions = ['flex', 'inline-flex']
const flexDirectionOptions = ['row', 'row-reverse', 'column', 'column-reverse']
const justifyContentOptions = ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly']
const alignItemsOptions = ['flex-start', 'flex-end', 'center', 'stretch', 'baseline']
const flexWrapOptions = ['nowrap', 'wrap', 'wrap-reverse']

export default function CSSFlexbox() {
  const [display, setDisplay] = useState('flex')
  const [flexDirection, setFlexDirection] = useState('row')
  const [justifyContent, setJustifyContent] = useState('flex-start')
  const [alignItems, setAlignItems] = useState('stretch')
  const [flexWrap, setFlexWrap] = useState('nowrap')
  const [gap, setGap] = useState(12)
  const [itemCount, setItemCount] = useState(4)
  const [itemColors] = useState(['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'])
  const [copied, setCopied] = useState(false)

  const cssCode = `.container {
  display: ${display};
  flex-direction: ${flexDirection};
  justify-content: ${justifyContent};
  align-items: ${alignItems};
  flex-wrap: ${flexWrap};
  gap: ${gap}px;
}`

  const containerStyle: React.CSSProperties = {
    display: display as React.CSSProperties['display'],
    flexDirection: flexDirection as React.CSSProperties['flexDirection'],
    justifyContent: justifyContent as React.CSSProperties['justifyContent'],
    alignItems: alignItems as React.CSSProperties['alignItems'],
    flexWrap: flexWrap as React.CSSProperties['flexWrap'],
    gap: gap,
    minHeight: 240,
    padding: 16,
    borderRadius: 12,
    border: '2px dashed var(--border)',
    background: 'var(--bg-secondary)',
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cssCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="flexbox-layout" style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>display</label>
            <select
              value={display}
              onChange={e => setDisplay(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 14 }}
            >
              {displayOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>flex-direction</label>
            <select
              value={flexDirection}
              onChange={e => setFlexDirection(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 14 }}
            >
              {flexDirectionOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>justify-content</label>
            <select
              value={justifyContent}
              onChange={e => setJustifyContent(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 14 }}
            >
              {justifyContentOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>align-items</label>
            <select
              value={alignItems}
              onChange={e => setAlignItems(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 14 }}
            >
              {alignItemsOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>flex-wrap</label>
            <select
              value={flexWrap}
              onChange={e => setFlexWrap(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 14 }}
            >
              {flexWrapOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
              gap: {gap}px
            </label>
            <input
              type="range"
              min={0}
              max={40}
              value={gap}
              onChange={e => setGap(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
              Items: {itemCount}
            </label>
            <input
              type="range"
              min={1}
              max={8}
              value={itemCount}
              onChange={e => setItemCount(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Live Preview
            </div>
            <div style={containerStyle}>
              {Array.from({ length: itemCount }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: flexDirection.includes('column') ? '100%' : 80,
                    height: flexDirection.includes('column') ? 40 : undefined,
                    padding: flexDirection.includes('column') ? '12px 0' : undefined,
                    background: itemColors[i % itemColors.length],
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: 14,
                    flex: flexDirection.includes('column') ? undefined : '1 1 0',
                    minHeight: flexDirection.includes('column') ? undefined : 60,
                  }}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

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
            }}>
              {cssCode}
            </pre>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .flexbox-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </ToolLayout>
  )
}
