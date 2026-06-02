'use client'
import { useState } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('base64')!

export default function Base64Tool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const process = () => {
    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))))
      } else {
        setOutput(decodeURIComponent(escape(atob(input))))
      }
      setError('')
    } catch (e: any) {
      setError(mode === 'decode' ? 'Invalid Base64 string' : 'Encoding error')
      setOutput('')
    }
  }

  const copy = async () => {
    if (output) {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <ToolLayout tool={tool}>
      <div style={{ marginBottom: 16 }}>
        <div className="options-row">
          <button
            className={`btn ${mode === 'encode' ? 'btn-primary' : ''}`}
            onClick={() => { setMode('encode'); setOutput(''); setError('') }}
          >
            Encode
          </button>
          <button
            className={`btn ${mode === 'decode' ? 'btn-primary' : ''}`}
            onClick={() => { setMode('decode'); setOutput(''); setError('') }}
          >
            Decode
          </button>
          <button className="btn" onClick={process}>Convert</button>
          <button className="btn" onClick={() => { setInput(''); setOutput(''); setError('') }}>Clear</button>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 8,
          padding: '10px 16px',
          color: 'var(--error)',
          fontSize: 13,
          marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      <div className="tool-grid">
        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
              {mode === 'encode' ? 'Plain Text' : 'Base64'}
            </span>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
              style={{ border: 'none', borderRadius: 0, minHeight: 250, padding: 16 }}
              spellCheck={false}
            />
          </div>
        </div>

        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
              {mode === 'encode' ? 'Base64' : 'Plain Text'}
            </span>
            {output && (
              <button className="btn btn-sm" onClick={copy}>
                {copied ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
              </button>
            )}
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <pre style={{
              padding: 16,
              minHeight: 250,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              margin: 0,
              fontSize: 13,
            }}>
              {output || <span style={{ color: 'var(--text-muted)' }}>Output will appear here...</span>}
            </pre>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
