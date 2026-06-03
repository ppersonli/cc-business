'use client'
import { useState, useCallback } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('json-to-go')!

function sanitizeGoName(name: string): string {
  // Capitalize first letter for exported Go fields
  const cleaned = name.replace(/[^a-zA-Z0-9_]/g, '_')
  if (/^[0-9]/.test(cleaned)) return '_' + cleaned
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

function goFieldName(jsonKey: string): string {
  const name = sanitizeGoName(jsonKey)
  return name.charAt(0).toUpperCase() + name.slice(1)
}

function inferGoType(val: any, fieldName: string, structs: Map<string, string>): string {
  if (val === null) return 'interface{}'
  if (val === undefined) return 'interface{}'

  if (Array.isArray(val)) {
    if (val.length === 0) return '[]interface{}'
    const itemType = inferGoType(val[0], fieldName + 'Item', structs)
    return '[]' + itemType
  }

  if (typeof val === 'object') {
    const structName = sanitizeGoName(fieldName)
    generateStruct(val, structName, structs)
    return structName
  }

  if (typeof val === 'string') return 'string'
  if (typeof val === 'number') {
    if (Number.isInteger(val)) {
      if (val >= -2147483648 && val <= 2147483647) return 'int32'
      return 'int64'
    }
    return 'float64'
  }
  if (typeof val === 'boolean') return 'bool'

  return 'interface{}'
}

function generateStruct(obj: any, name: string, structs: Map<string, string>): void {
  if (structs.has(name)) return

  const lines: string[] = []
  lines.push(`type ${name} struct {`)

  for (const [key, val] of Object.entries(obj)) {
    const goField = goFieldName(key)
    const goType = inferGoType(val, name + goField, structs)
    const jsonTag = `\`json:"${key}"\``
    lines.push(`\t${goField} ${goType} ${jsonTag}`)
  }

  lines.push('}')
  structs.set(name, lines.join('\n'))
}

function jsonToGo(json: string, rootName: string): string {
  const parsed = JSON.parse(json)
  const structs = new Map<string, string>()

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
      generateStruct(parsed[0], rootName, structs)
    } else {
      return `// Root type: ${typeof parsed === 'object' ? 'array/object' : typeof parsed}`
    }
  } else {
    generateStruct(parsed, rootName, structs)
  }

  return Array.from(structs.values()).join('\n\n')
}

export default function JsonToGo() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [rootName, setRootName] = useState('Root')
  const [usePointers, setUsePointers] = useState(false)

  const convert = useCallback(() => {
    try {
      let result = jsonToGo(input, rootName)
      if (usePointers) {
        // Replace non-primitive types with pointers (except slices)
        result = result.replace(/(\w+)\s+(?!interface{})(string|int32|int64|float64|bool|map\[)/g, '$1 *')
      }
      setOutput(result)
      setError('')
    } catch (e: any) {
      setError(e.message || 'Invalid JSON')
      setOutput('')
    }
  }, [input, rootName, usePointers])

  const copy = useCallback(() => {
    if (output) {
      navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }, [output])

  const loadSample = useCallback(() => {
    setInput(JSON.stringify({
      "name": "DevTools Hub",
      "version": 1.0,
      "active": true,
      "rating": 4.8,
      "tags": ["developer", "tools", "free"],
      "author": {
        "name": "Developer",
        "email": "dev@example.com",
        "verified": true
      },
      "features": [
        { "name": "JSON Formatter", "category": "Data", "enabled": true }
      ],
      "stats": {
        "users": 15000,
        "tools": 60,
        "uptime": 99.9
      }
    }, null, 2))
  }, [])

  return (
    <ToolLayout tool={tool}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={convert}>Convert to Go</button>
          <button className="btn" onClick={loadSample}>Load Sample</button>
          <button className="btn" onClick={() => { setInput(''); setOutput(''); setError('') }}>Clear</button>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            Struct name:
            <input
              type="text"
              value={rootName}
              onChange={e => setRootName(e.target.value)}
              style={{ width: 80, padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 12, background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            />
          </label>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <input type="checkbox" checked={usePointers} onChange={e => setUsePointers(e.target.checked)} />
            Use pointers
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
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Go Output</span>
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
                {output || <span style={{ color: 'var(--text-muted)' }}>Go structs will appear here...</span>}
              </pre>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20, padding: 16, background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
        <strong style={{ color: 'var(--text-primary)' }}>How it works:</strong> Paste your JSON data and this tool generates Go structs with json tags. 
        Nested objects create separate structs, arrays use slice types, and primitives map to <code>string</code>, <code>int32</code>, <code>int64</code>, <code>float64</code>, or <code>bool</code>. 
        Enable &quot;Use pointers&quot; to use pointer types for non-primitive fields.
      </div>
    </ToolLayout>
  )
}
