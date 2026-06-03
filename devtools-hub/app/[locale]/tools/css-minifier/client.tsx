'use client'
import { useState, useMemo } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('css-minifier')!

function minifyCSS(css: string, options: { comments: boolean; whitespace: boolean }): string {
  let result = css

  // Remove single-line comments (not inside strings)
  if (options.comments) {
    result = result.replace(/\/\*[\s\S]*?\*\//g, '')
  }

  if (options.whitespace) {
    // Remove newlines and excess whitespace
    result = result.replace(/\s*\n\s*/g, '')
    // Remove spaces around {, }, :, ;, ,
    result = result.replace(/\s*{\s*/g, '{')
    result = result.replace(/\s*}\s*/g, '}')
    result = result.replace(/\s*:\s*/g, ':')
    result = result.replace(/\s*;\s*/g, ';')
    result = result.replace(/\s*,\s*/g, ',')
    // Remove trailing semicolons before }
    result = result.replace(/;}/g, '}')
    // Remove leading/trailing whitespace
    result = result.trim()
  }

  return result
}

const SAMPLE = `/* Main styles */
body {
  font-family: system-ui, -apple-system, sans-serif;
  background-color: #0a0a0f;
  color: #e4e4e7;
  line-height: 1.6;
  margin: 0;
  padding: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
}

/* Header */
.header {
  background: #12121a;
  border-bottom: 1px solid #27272a;
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  border: 1px solid #27272a;
  background: #1a1a2e;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn:hover {
  background: #22223a;
  border-color: #3f3f46;
}

.btn-primary {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}
`

export default function CssMinifier() {
  const [input, setInput] = useState(SAMPLE)
  const [removeComments, setRemoveComments] = useState(true)
  const [removeWhitespace, setRemoveWhitespace] = useState(true)
  const [copied, setCopied] = useState(false)

  const output = useMemo(() => minifyCSS(input, { comments: removeComments, whitespace: removeWhitespace }), [input, removeComments, removeWhitespace])

  const savings = input.length > 0 ? Math.round((1 - output.length / input.length) * 100) : 0

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
          <button className="btn" onClick={() => setInput(SAMPLE)}>Load Sample</button>
          <button className="btn" onClick={() => { setInput('') }}>Clear</button>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer', marginLeft: 16 }}>
            <input type="checkbox" checked={removeComments} onChange={e => setRemoveComments(e.target.checked)} />
            Remove comments
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input type="checkbox" checked={removeWhitespace} onChange={e => setRemoveWhitespace(e.target.checked)} />
            Remove whitespace
          </label>
        </div>
      </div>

      <div className="tool-grid">
        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Input CSS</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{input.length} bytes</span>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste your CSS here..."
              style={{ border: 'none', borderRadius: 0, minHeight: 350, padding: 16 }}
              spellCheck={false}
            />
          </div>
        </div>

        <div className="tool-panel">
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Minified</span>
              {input && <span className="status-badge status-valid">-{savings}%</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{output.length} bytes</span>
              {output && (
                <button className="btn btn-sm" onClick={copy}>
                  {copied ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
                </button>
              )}
            </div>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <pre style={{
              padding: 16,
              minHeight: 350,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              margin: 0,
              fontSize: 13,
            }}>
              {output || <span style={{ color: 'var(--text-muted)' }}>Minified CSS will appear here...</span>}
            </pre>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
