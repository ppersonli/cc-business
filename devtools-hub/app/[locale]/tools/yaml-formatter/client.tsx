'use client'
import { useState } from 'react'
import yaml from 'js-yaml'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('yaml-formatter')!

export default function YamlFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'format' | 'toJson' | 'fromJson'>('format')
  const [indent, setIndent] = useState(2)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleFormat = () => {
    setError('')
    try {
      if (mode === 'format') {
        const parsed = yaml.load(input)
        setOutput(yaml.dump(parsed, { indent, lineWidth: 120, noRefs: true }))
      } else if (mode === 'toJson') {
        const parsed = yaml.load(input)
        setOutput(JSON.stringify(parsed, null, indent))
      } else {
        const parsed = JSON.parse(input)
        setOutput(yaml.dump(parsed, { indent, lineWidth: 120, noRefs: true }))
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid input')
      setOutput('')
    }
  }

  const handleCopy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolLayout tool={tool}>
      <div style={{ marginBottom: 16 }}>
        <div className="options-row">
          <button className={`btn ${mode === 'format' ? 'btn-primary' : ''}`} onClick={() => setMode('format')}>Format YAML</button>
          <button className={`btn ${mode === 'toJson' ? 'btn-primary' : ''}`} onClick={() => setMode('toJson')}>YAML → JSON</button>
          <button className={`btn ${mode === 'fromJson' ? 'btn-primary' : ''}`} onClick={() => setMode('fromJson')}>JSON → YAML</button>
          <div className="option-group">
            <label>Indent:</label>
            <select value={indent} onChange={e => setIndent(Number(e.target.value))}>
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
            </select>
          </div>
        </div>
      </div>

      <div className="tool-grid">
        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
              {mode === 'fromJson' ? 'JSON Input' : 'YAML Input'}
            </span>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={mode === 'fromJson' ? '{"key": "value"}' : 'key: value\nlist:\n  - item1\n  - item2'}
              style={{ border: 'none', borderRadius: 0, minHeight: 300, padding: 16 }}
              spellCheck={false}
            />
          </div>
        </div>

        <div className="tool-panel">
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                {mode === 'toJson' ? 'JSON Output' : 'YAML Output'}
              </span>
              {output && !error && <span className="status-badge status-valid">Valid</span>}
              {error && <span className="status-badge status-invalid">Error</span>}
            </div>
            {output && (
              <button className="btn btn-sm" onClick={handleCopy}>
                {copied ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
              </button>
            )}
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            {error ? (
              <div style={{ padding: 16, color: 'var(--error, #ef4444)', fontSize: 13, fontFamily: 'monospace' }}>
                {error}
              </div>
            ) : (
              <pre style={{
                padding: 16,
                minHeight: 300,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                margin: 0,
                fontSize: 13,
              }}>
                {output || <span style={{ color: 'var(--text-muted)' }}>Output will appear here...</span>}
              </pre>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <button className="btn btn-primary" onClick={handleFormat}>
          {mode === 'format' ? 'Format' : mode === 'toJson' ? 'Convert to JSON' : 'Convert to YAML'}
        </button>
      </div>
    </ToolLayout>
  )
}
