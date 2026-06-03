'use client'
import { useState } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('json-formatter')!

export default function JsonFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [status, setStatus] = useState<'idle' | 'valid' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [copied, setCopied] = useState(false)
  const [indent, setIndent] = useState(2)

  const format = () => {
    try {
      const obj = JSON.parse(input)
      setOutput(JSON.stringify(obj, null, indent))
      setStatus('valid')
      setErrorMsg('')
    } catch (e: any) {
      setStatus('error')
      setErrorMsg(e.message)
      setOutput('')
    }
  }

  const minify = () => {
    try {
      const obj = JSON.parse(input)
      setOutput(JSON.stringify(obj))
      setStatus('valid')
      setErrorMsg('')
    } catch (e: any) {
      setStatus('error')
      setErrorMsg(e.message)
    }
  }

  const copy = async () => {
    if (output) {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  const lineCount = (s: string) => s ? s.split('\n').length : 0

  return (
    <ToolLayout tool={tool}>
      <div style={{ marginBottom: 16 }}>
        <div className="options-row">
          <button className="btn btn-primary" onClick={format}>Format</button>
          <button className="btn" onClick={minify}>Minify</button>
          <button className="btn" onClick={() => { setInput(''); setOutput(''); setStatus('idle') }}>Clear</button>
          <div className="option-group" style={{ marginLeft: 'auto' }}>
            <label>Indent:</label>
            <select value={indent} onChange={e => setIndent(Number(e.target.value))}>
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value={1}>Tab</option>
            </select>
          </div>
        </div>
      </div>

      <div className="tool-grid">
        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Input</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lineCount(input)} lines</span>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder='Paste your JSON here...\n{"key": "value"}'
              style={{ border: 'none', borderRadius: 0, minHeight: 300, padding: 16 }}
              spellCheck={false}
            />
          </div>
        </div>

        <div className="tool-panel">
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Output</span>
              {status === 'valid' && <span className="status-badge status-valid">Valid JSON</span>}
              {status === 'error' && <span className="status-badge status-invalid">Error</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lineCount(output)} lines</span>
              {output && (
                <button className="btn btn-sm" onClick={copy}>
                  {copied ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
                </button>
              )}
            </div>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            {status === 'error' && errorMsg ? (
              <div style={{ padding: 16, color: 'var(--error)', fontSize: 13, fontFamily: 'monospace' }}>
                {errorMsg}
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
                {output || <span style={{ color: 'var(--text-muted)' }}>Formatted output will appear here...</span>}
              </pre>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
