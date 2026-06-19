'use client'
import { useState, useMemo } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'

const tool = getToolBySlug('css-specificity')!

interface Specificity { inline: number; ids: number; classes: number; elements: number }

function calcSpecificity(selector: string): Specificity {
  const result: Specificity = { inline: 0, ids: 0, classes: 0, elements: 0 }
  if (!selector.trim()) return result

  // Remove :not() content but count inner selectors
  let s = selector.trim()
  const notRegex = /:not\(([^)]*)\)/g
  let notMatch
  while ((notMatch = notRegex.exec(s)) !== null) {
    const inner = notMatch[1]
    const innerResult = calcSpecificity(inner)
    result.ids += innerResult.ids
    result.classes += innerResult.classes
    result.elements += innerResult.elements
  }
  s = s.replace(notRegex, '')

  // Remove content in brackets (attribute selectors counted below)
  const attrCount = (s.match(/\[[^\]]*\]/g) || []).length
  result.classes += attrCount
  s = s.replace(/\[[^\]]*\]/g, '')

  // Count IDs: #id
  const ids = (s.match(/#[a-zA-Z_-][\w-]*/g) || []).length
  result.ids += ids

  // Count classes, pseudo-classes: .class, :hover, :nth-child()
  const classes = (s.match(/\.[a-zA-Z_-][\w-]*/g) || []).length
  const pseudoClasses = (s.match(/:(?!:)[a-zA-Z-][\w-]*(?:\([^)]*\))?/g) || []).length
  result.classes += classes + pseudoClasses

  // Count pseudo-elements: ::before, ::after, etc. (count as elements)
  const pseudoElements = (s.match(/::[a-zA-Z-]+/g) || []).length
  result.elements += pseudoElements

  // Count elements and * (but * has 0 specificity)
  const cleaned = s.replace(/#[a-zA-Z_-][\w-]*/g, '')
    .replace(/\.[a-zA-Z_-][\w-]*/g, '')
    .replace(/:[^:,+\s>~]*/g, '')
    .replace(/[,+\s>~]+/g, ' ')
    .trim()

  const elements = cleaned.split(/\s+/).filter(t => t && t !== '*').length
  result.elements += elements

  return result
}

function specificityToString(s: Specificity): string {
  return `${s.inline},${s.ids},${s.classes},${s.elements}`
}

function specificityToNumber(s: Specificity): number {
  return s.inline * 1000 + s.ids * 100 + s.classes * 10 + s.elements
}

const EXAMPLES = [
  { selector: '*', desc: 'Universal selector' },
  { selector: 'div', desc: 'Element' },
  { selector: '.class', desc: 'Class' },
  { selector: '#id', desc: 'ID' },
  { selector: 'div.class', desc: 'Element + Class' },
  { selector: '#id .class div', desc: 'ID + Class + Element' },
  { selector: 'div > p:first-child', desc: 'Combinator + Pseudo-class' },
  { selector: 'a::before', desc: 'Element + Pseudo-element' },
  { selector: '#nav .item:hover', desc: 'ID + Class + Pseudo-class' },
  { selector: '[type="text"]', desc: 'Attribute selector' },
]

interface CompareEntry { selector: string; spec: Specificity }

export default function CssSpecificityCalculator() {
  const [selector, setSelector] = useState('#nav .item:hover')
  const [compareList, setCompareList] = useState<CompareEntry[]>([
    { selector: 'div', spec: calcSpecificity('div') },
    { selector: '.class', spec: calcSpecificity('.class') },
    { selector: '#id', spec: calcSpecificity('#id') },
  ])
  const [newCompare, setNewCompare] = useState('')

  const spec = useMemo(() => calcSpecificity(selector), [selector])

  const addCompare = () => {
    if (!newCompare.trim()) return
    setCompareList([...compareList, { selector: newCompare.trim(), spec: calcSpecificity(newCompare.trim()) }])
    setNewCompare('')
  }

  const removeCompare = (i: number) => setCompareList(compareList.filter((_, idx) => idx !== i))

  const sortedCompare = useMemo(() =>
    [...compareList].sort((a, b) => specificityToNumber(b.spec) - specificityToNumber(a.spec)),
    [compareList]
  )

  return (
    <ToolLayout tool={tool}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '24px 16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', marginBottom: '8px' }}>
          CSS Specificity Calculator
        </h1>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>
          Calculate and compare CSS selector specificity
        </p>

        {/* Input */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#64748b' }}>CSS Selector</label>
          <input
            value={selector} onChange={(e) => setSelector(e.target.value)}
            placeholder="e.g. #nav .item:hover"
            style={{ width: '100%', padding: '14px 16px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '16px', fontFamily: 'monospace', boxSizing: 'border-box' }}
          />
        </div>

        {/* Result */}
        <div style={{ textAlign: 'center', padding: '24px', backgroundColor: '#f8fafc', borderRadius: '16px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '48px', fontWeight: 800, color: '#3b82f6', fontFamily: 'monospace' }}>
            ({specificityToString(spec)})
          </div>
          <div style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
            Specificity = {specificityToNumber(spec)} points
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
          {[
            { label: 'Inline', value: spec.inline, desc: 'style=""', color: '#ef4444' },
            { label: 'IDs', value: spec.ids, desc: '#id', color: '#f59e0b' },
            { label: 'Classes', value: spec.classes, desc: '.class :pseudo [attr]', color: '#3b82f6' },
            { label: 'Elements', value: spec.elements, desc: 'div ::pseudo', color: '#10b981' },
          ].map(item => (
            <div key={item.label} style={{ padding: '16px', textAlign: 'center', backgroundColor: '#fff', border: `2px solid ${item.color}30`, borderRadius: '12px' }}>
              <div style={{ fontSize: '28px', fontWeight: 800, color: item.color }}>{item.value}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>{item.label}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Examples */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Quick Examples</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {EXAMPLES.map(ex => (
              <button key={ex.selector} onClick={() => setSelector(ex.selector)}
                title={ex.desc}
                style={{ padding: '6px 12px', backgroundColor: selector === ex.selector ? '#3b82f6' : '#f1f5f9', color: selector === ex.selector ? '#fff' : '#475569', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: 'monospace' }}>
                {ex.selector}
              </button>
            ))}
          </div>
        </div>

        {/* Compare */}
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Compare Selectors</h2>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input value={newCompare} onChange={(e) => setNewCompare(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCompare()}
              placeholder="Add a selector to compare..."
              style={{ flex: 1, padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontFamily: 'monospace' }} />
            <button onClick={addCompare} style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
              Add
            </button>
          </div>
          {sortedCompare.length > 0 && (
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
              {sortedCompare.map((entry, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: i < sortedCompare.length - 1 ? '1px solid #f1f5f9' : 'none', backgroundColor: i === 0 ? '#f0fdf4' : '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>#{i + 1}</span>
                    <code style={{ fontSize: '14px', fontFamily: 'monospace' }}>{entry.selector}</code>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', fontFamily: 'monospace', color: '#3b82f6', fontWeight: 600 }}>({specificityToString(entry.spec)})</span>
                    <button onClick={() => removeCompare(compareList.indexOf(entry))} style={{ color: '#94a3b8', border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Explanation */}
        <div style={{ marginTop: '32px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>How Specificity Works</h3>
          <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.7 }}>
            <p style={{ marginBottom: '8px' }}>Specificity is calculated as <strong>(a, b, c, d)</strong> where:</p>
            <ul style={{ paddingLeft: '20px', margin: 0 }}>
              <li><strong>a</strong> = Inline styles (style attribute)</li>
              <li><strong>b</strong> = Number of ID selectors</li>
              <li><strong>c</strong> = Number of class selectors, attribute selectors, and pseudo-classes</li>
              <li><strong>d</strong> = Number of element selectors and pseudo-elements</li>
            </ul>
            <p style={{ marginTop: '8px', marginBottom: 0 }}>Higher specificity wins. <code>!important</code> overrides all specificity rules.</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
