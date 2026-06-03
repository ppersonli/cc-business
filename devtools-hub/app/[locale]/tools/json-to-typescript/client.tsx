'use client'
import { useState } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('json-to-typescript')!

function jsonToTs(obj: any, name: string = 'Root', indent: number = 0, interfaces: string[] = []): string {
  const pad = '  '.repeat(indent)

  if (obj === null) return `${pad}${name}: null`
  if (obj === undefined) return `${pad}${name}: undefined`

  if (Array.isArray(obj)) {
    if (obj.length === 0) return `${pad}${name}: any[]`
    const itemType = inferType(obj[0], name + 'Item', indent, interfaces)
    return `${pad}${name}: ${itemType}[]`
  }

  if (typeof obj === 'object') {
    const keys = Object.keys(obj)
    const interfaceName = sanitizeName(name)
    const lines: string[] = []

    lines.push(`${pad}interface ${interfaceName} {`)

    for (const key of keys) {
      const val = obj[key]
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`

      if (val === null) {
        lines.push(`${pad}  ${safeKey}: null`)
      } else if (val === undefined) {
        lines.push(`${pad}  ${safeKey}: undefined`)
      } else if (Array.isArray(val)) {
        if (val.length === 0) {
          lines.push(`${pad}  ${safeKey}: any[]`)
        } else {
          const itemType = inferType(val[0], interfaceName + key.charAt(0).toUpperCase() + key.slice(1) + 'Item', indent + 1, interfaces)
          lines.push(`${pad}  ${safeKey}: ${itemType}[]`)
        }
      } else if (typeof val === 'object') {
        const nestedName = interfaceName + key.charAt(0).toUpperCase() + key.slice(1)
        jsonToTs(val, nestedName, indent + 1, interfaces)
        // Check if interface was already added
        const existing = interfaces.find(i => i.startsWith(`interface ${nestedName}`))
        if (!existing) {
          lines.push(`${pad}  ${safeKey}: ${nestedName}`)
        } else {
          lines.push(`${pad}  ${safeKey}: ${nestedName}`)
        }
      } else if (typeof val === 'string') {
        lines.push(`${pad}  ${safeKey}: string`)
      } else if (typeof val === 'number') {
        lines.push(`${pad}  ${safeKey}: number`)
      } else if (typeof val === 'boolean') {
        lines.push(`${pad}  ${safeKey}: boolean`)
      } else {
        lines.push(`${pad}  ${safeKey}: any`)
      }
    }

    lines.push(`${pad}}`)

    const interfaceStr = lines.join('\n')
    interfaces.push(interfaceStr)

    return interfaceStr
  }

  return `${pad}${name}: ${typeof obj}`
}

function inferType(val: any, name: string, indent: number, interfaces: string[]): string {
  if (val === null) return 'null'
  if (val === undefined) return 'undefined'
  if (Array.isArray(val)) {
    if (val.length === 0) return 'any[]'
    const itemType = inferType(val[0], name + 'Item', indent, interfaces)
    return `${itemType}[]`
  }
  if (typeof val === 'object') {
    const interfaceName = sanitizeName(name)
    // Check if already exists
    const existing = interfaces.find(i => i.startsWith(`interface ${interfaceName}`))
    if (!existing) {
      jsonToTs(val, name, indent, interfaces)
    }
    return interfaceName
  }
  return typeof val
}

function sanitizeName(name: string): string {
  // Ensure it's a valid TS identifier
  let clean = name.replace(/[^a-zA-Z0-9_$]/g, '')
  if (/^[0-9]/.test(clean)) clean = '_' + clean
  return clean || 'Root'
}

export default function JsonToTypescript() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [rootName, setRootName] = useState('Root')
  const [optionalFields, setOptionalFields] = useState(false)

  const convert = () => {
    try {
      const parsed = JSON.parse(input)
      const interfaces: string[] = []
      jsonToTs(parsed, rootName, 0, interfaces)

      let result = interfaces.join('\n\n')

      if (optionalFields) {
        result = result.replace(/(\w+):/g, '$1?:')
        // Don't double-add ? to already optional
        result = result.replace(/\?\?:/g, '?:')
      }

      setOutput(result)
      setError('')
    } catch (e: any) {
      setError(e.message || 'Invalid JSON')
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

  const sampleJson = () => {
    const sample = {
      "name": "DevTools Hub",
      "version": "1.0",
      "active": true,
      "rating": 4.8,
      "tags": ["developer", "tools", "free"],
      "author": {
        "name": "Developer",
        "email": "dev@example.com",
        "verified": true
      },
      "features": [
        { "name": "JSON Formatter", "category": "Data" }
      ]
    }
    setInput(JSON.stringify(sample, null, 2))
  }

  return (
    <ToolLayout tool={tool}>
      <div style={{ marginBottom: 16 }}>
        <div className="options-row" style={{ flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={convert}>Convert to TypeScript</button>
          <button className="btn" onClick={sampleJson}>Load Sample</button>
          <button className="btn" onClick={() => { setInput(''); setOutput(''); setError('') }}>Clear</button>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            Root name:
            <input
              type="text"
              value={rootName}
              onChange={e => setRootName(e.target.value)}
              style={{ width: 80, padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 12, background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            />
          </label>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <input type="checkbox" checked={optionalFields} onChange={e => setOptionalFields(e.target.checked)} />
            Optional fields
          </label>
        </div>
      </div>

      <div className="tool-grid">
        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>JSON Input</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{input.split('\n').length} lines</span>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={`{\n  "name": "Example",\n  "count": 42,\n  "active": true,\n  "items": ["a", "b"]\n}`}
              style={{ border: 'none', borderRadius: 0, minHeight: 300, padding: 16, fontFamily: 'monospace', fontSize: 13 }}
              spellCheck={false}
            />
          </div>
        </div>

        <div className="tool-panel">
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>TypeScript Output</span>
              {output && <span className="status-badge status-valid">Converted</span>}
              {error && <span className="status-badge status-invalid">Error</span>}
            </div>
            {output && (
              <button className="btn btn-sm" onClick={copy}>
                {copied ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
              </button>
            )}
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            {error ? (
              <div style={{ padding: 16, color: 'var(--error)', fontSize: 13, fontFamily: 'monospace' }}>{error}</div>
            ) : (
              <pre style={{
                padding: 16,
                minHeight: 300,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                margin: 0,
                fontSize: 13,
                fontFamily: 'monospace',
              }}>
                {output || <span style={{ color: 'var(--text-muted)' }}>TypeScript interfaces will appear here...</span>}
              </pre>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20, padding: 16, background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
        <strong style={{ color: 'var(--text-primary)' }}>How it works:</strong> Paste your JSON data and this tool generates TypeScript interfaces with inferred types. Nested objects create nested interfaces, arrays infer element types, and primitives map to <code>string</code>, <code>number</code>, or <code>boolean</code>. Enable &quot;Optional fields&quot; to make all properties optional with <code>?</code>.
      </div>
    </ToolLayout>
  )
}
