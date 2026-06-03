'use client'
import { useState, useMemo } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'

const tool = getToolBySlug('regex-tester')!

const FLAG_OPTIONS = [
  { label: 'g', name: 'Global' },
  { label: 'i', name: 'Case Insensitive' },
  { label: 'm', name: 'Multiline' },
  { label: 's', name: 'Dot All' },
]

export default function RegexTester() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [testString, setTestString] = useState('')

  const result = useMemo(() => {
    if (!pattern || !testString) return { matches: [], error: null, highlighted: null }
    try {
      const regex = new RegExp(pattern, flags)
      const matches: { text: string; index: number; groups?: string[] }[] = []
      let m: RegExpExecArray | null

      if (flags.includes('g')) {
        while ((m = regex.exec(testString)) !== null) {
          matches.push({ text: m[0], index: m.index, groups: m.slice(1) })
          if (m.index === regex.lastIndex) regex.lastIndex++
        }
      } else {
        m = regex.exec(testString)
        if (m) matches.push({ text: m[0], index: m.index, groups: m.slice(1) })
      }

      // Build highlighted text
      const parts: React.ReactNode[] = []
      let last = 0
      for (const match of matches) {
        if (match.index > last) parts.push(testString.slice(last, match.index))
        parts.push(
          <mark key={match.index} style={{
            background: 'rgba(59,130,246,0.35)',
            borderRadius: 2,
            padding: '1px 2px',
          }}>
            {match.text}
          </mark>
        )
        last = match.index + match.text.length
      }
      if (last < testString.length) parts.push(testString.slice(last))

      return { matches, error: null, highlighted: parts }
    } catch (e: any) {
      return { matches: [], error: e.message, highlighted: null }
    }
  }, [pattern, flags, testString])

  const toggleFlag = (flag: string) => {
    setFlags(flags.includes(flag) ? flags.replace(flag, '') : flags + flag)
  }

  return (
    <ToolLayout tool={tool}>
      <div style={{ marginBottom: 16 }}>
        <div className="options-row">
          <div className="option-group">
            <label>Regex:</label>
            <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 13 }}>/</span>
          </div>
          <input
            type="text"
            value={pattern}
            onChange={e => setPattern(e.target.value)}
            placeholder="Enter regex pattern..."
            style={{ flex: 1, minWidth: 200 }}
          />
          <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 13 }}>/</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {FLAG_OPTIONS.map(f => (
              <button
                key={f.label}
                className={`btn btn-sm ${flags.includes(f.label) ? 'btn-primary' : ''}`}
                onClick={() => toggleFlag(f.label)}
                title={f.name}
                style={{ minWidth: 32, justifyContent: 'center', fontFamily: 'monospace' }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {result.error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 8,
          padding: '10px 16px',
          color: 'var(--error)',
          fontSize: 13,
          marginBottom: 16,
        }}>
          {result.error}
        </div>
      )}

      <div className="tool-grid">
        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Test String</span>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <textarea
              value={testString}
              onChange={e => setTestString(e.target.value)}
              placeholder="Enter test string..."
              style={{ border: 'none', borderRadius: 0, minHeight: 200, padding: 16 }}
              spellCheck={false}
            />
          </div>
        </div>

        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
              Matches ({result.matches.length})
            </span>
          </div>
          <div className="panel-body">
            {result.highlighted && result.highlighted.length > 0 ? (
              <pre style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                margin: 0,
                lineHeight: 1.8,
              }}>
                {result.highlighted}
              </pre>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Matches will appear here...</div>
            )}

            {result.matches.length > 0 && (
              <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
                  MATCH DETAILS
                </div>
                {result.matches.map((m, i) => (
                  <div key={i} style={{
                    padding: '6px 0',
                    fontSize: 13,
                    fontFamily: 'monospace',
                    borderBottom: i < result.matches.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <span style={{ color: 'var(--text-muted)' }}>#{i + 1} @ {m.index}: </span>
                    <span style={{ color: 'var(--accent)' }}>&quot;{m.text}&quot;</span>
                    {m.groups && m.groups.length > 0 && (
                      <span style={{ color: 'var(--text-muted)' }}> [{m.groups.map((g, j) => `$${j + 1}="${g}"`).join(', ')}]</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
