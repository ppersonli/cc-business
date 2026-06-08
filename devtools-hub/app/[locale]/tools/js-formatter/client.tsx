'use client'
import { useState } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('js-formatter')!

function formatJS(input: string, indent: number = 2): string {
  let result = ''
  let level = 0
  let inString = false
  let stringChar = ''
  let inTemplate = false
  let templateDepth = 0
  let inComment = false
  let inBlockComment = false
  let i = 0

  while (i < input.length) {
    const ch = input[i]
    const next = input[i + 1]

    if (inBlockComment) {
      result += ch
      if (ch === '*' && next === '/') {
        result += '/'
        inBlockComment = false
        i += 2
        continue
      }
      i++
      continue
    }

    if (inComment) {
      result += ch
      if (ch === '\n') {
        inComment = false
      }
      i++
      continue
    }

    if (inString) {
      result += ch
      if (ch === '\\') {
        if (i + 1 < input.length) {
          result += input[i + 1]
          i += 2
          continue
        }
      }
      if (ch === stringChar) {
        inString = false
      }
      i++
      continue
    }

    if (inTemplate) {
      result += ch
      if (ch === '\\' && i + 1 < input.length) {
        result += input[i + 1]
        i += 2
        continue
      }
      if (ch === '$' && next === '{') {
        templateDepth++
        result += '{'
        i += 2
        continue
      }
      if (ch === '{' && i > 0 && input[i - 1] === '$') {
        templateDepth++
      }
      if (ch === '}' && templateDepth > 0) {
        templateDepth--
        i++
        continue
      }
      if (ch === '`' && templateDepth === 0) {
        inTemplate = false
      }
      i++
      continue
    }

    if (ch === '/' && next === '/') {
      inComment = true
      result += '//'
      i += 2
      continue
    }
    if (ch === '/' && next === '*') {
      inBlockComment = true
      result += '/*'
      i += 2
      continue
    }

    if (ch === '"' || ch === "'") {
      inString = true
      stringChar = ch
      result += ch
      i++
      continue
    }
    if (ch === '`') {
      inTemplate = true
      templateDepth = 0
      result += ch
      i++
      continue
    }

    if (ch === '\n' || ch === '\r') {
      i++
      continue
    }
    if (ch === ' ' || ch === '\t') {
      i++
      continue
    }

    if (ch === '{' || ch === '[' || ch === '(') {
      if (ch === '{') level++
      result += ch
      let j = i + 1
      while (j < input.length && (input[j] === ' ' || input[j] === '\t' || input[j] === '\n' || input[j] === '\r')) j++
      if (j < input.length && input[j] !== '}' && input[j] !== ']' && input[j] !== ')') {
        result += '\n' + ' '.repeat(level * indent)
      }
      i++
      continue
    }
    if (ch === '}' || ch === ']' || ch === ')') {
      if (ch === '}') level--
      result = result.trimEnd()
      result += '\n' + ' '.repeat(level * indent) + ch
      let j = i + 1
      while (j < input.length && (input[j] === ' ' || input[j] === '\t')) j++
      if (j < input.length && input[j] !== ';' && input[j] !== ',' && input[j] !== ')' && input[j] !== ']' && input[j] !== '}') {
        result += '\n' + ' '.repeat(level * indent)
      }
      i++
      continue
    }

    if (ch === ',' || ch === ';') {
      result = result.trimEnd()
      result += ch
      let j = i + 1
      while (j < input.length && (input[j] === ' ' || input[j] === '\t')) j++
      if (j < input.length && input[j] !== '\n' && input[j] !== '}' && input[j] !== ']' && input[j] !== ')') {
        result += '\n' + ' '.repeat(level * indent)
      } else if (ch === ';' && j < input.length && (input[j] === '}' || input[j] === ']' || input[j] === ')')) {
        result += '\n' + ' '.repeat(level * indent)
      }
      i++
      continue
    }

    if (ch === ':') {
      result += ch + ' '
      i++
      continue
    }

    if (ch === '=' && next !== '=' && !(i > 0 && input[i - 1] === '=')) {
      result += ' = '
      i++
      continue
    }

    if (ch === '>' && i > 0 && input[i - 1] === '=' ) {
      result += ch
      i++
      continue
    }

    result += ch
    i++
  }

  return result
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+/, '')
    .replace(/\s+$/, '\n')
}

function minifyJS(input: string): string {
  let result = ''
  let inString = false
  let stringChar = ''
  let inTemplate = false
  let inComment = false
  let inBlockComment = false

  for (let i = 0; i < input.length; i++) {
    const ch = input[i]
    const next = input[i + 1]

    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false
        i++
      }
      continue
    }
    if (inComment) {
      if (ch === '\n') inComment = false
      continue
    }
    if (inString) {
      result += ch
      if (ch === '\\' && i + 1 < input.length) {
        result += input[i + 1]
        i++
        continue
      }
      if (ch === stringChar) inString = false
      continue
    }
    if (inTemplate) {
      result += ch
      if (ch === '`' && i > 0) {
        inTemplate = false
      }
      continue
    }

    if (ch === '/' && next === '/') {
      inComment = true
      i++
      continue
    }
    if (ch === '/' && next === '*') {
      inBlockComment = true
      i++
      continue
    }
    if (ch === '"' || ch === "'") {
      inString = true
      stringChar = ch
      result += ch
      continue
    }
    if (ch === '`') {
      inTemplate = true
      result += ch
      continue
    }

    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      if (result.length > 0) {
        const last = result[result.length - 1]
        const isAlphaNum = (c: string) => /[a-zA-Z0-9_$]/.test(c)
        if (isAlphaNum(last) && next && isAlphaNum(next)) {
          result += ' '
        }
      }
      continue
    }

    result += ch
  }

  return result
}

export default function JSFormatter() {
  const [input, setInput] = useState(`function greet(name) {
  const message = "Hello, " + name + "!";
  console.log(message);
  return {
    status: "ok",
    timestamp: Date.now(),
    data: [1, 2, 3]
  };
}

const users = [{id: 1, name: "Alice"}, {id: 2, name: "Bob"}];
const result = users.filter(u => u.id > 1).map(u => u.name);`)
  const [output, setOutput] = useState('')
  const [indent, setIndent] = useState(2)
  const [mode, setMode] = useState<'format' | 'minify'>('format')
  const [copied, setCopied] = useState(false)

  const handleFormat = () => {
    if (mode === 'format') {
      setOutput(formatJS(input, indent))
    } else {
      setOutput(minifyJS(input))
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolLayout tool={tool}>
      <div style={{ marginBottom: 16 }}>
        <div className="options-row">
          <button
            className={`btn ${mode === 'format' ? 'btn-primary' : ''}`}
            onClick={() => { setMode('format'); setTimeout(() => {
              setOutput(formatJS(input, indent))
            }, 0) }}
          >
            Format
          </button>
          <button
            className={`btn ${mode === 'minify' ? 'btn-primary' : ''}`}
            onClick={() => { setMode('minify'); setTimeout(() => {
              setOutput(minifyJS(input))
            }, 0) }}
          >
            Minify
          </button>
          {mode === 'format' && (
            <div className="option-group">
              <label>Indent:</label>
              {[2, 4].map(n => (
                <button
                  key={n}
                  className={`btn btn-sm ${indent === n ? 'btn-primary' : ''}`}
                  onClick={() => setIndent(n)}
                >
                  {n} spaces
                </button>
              ))}
            </div>
          )}
          <button className="btn btn-primary" onClick={handleFormat} style={{ marginLeft: 'auto' }}>
            {mode === 'format' ? 'Format' : 'Minify'}
          </button>
        </div>
      </div>

      <div className="tool-grid">
        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Input</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{input ? input.split('\n').length : 0} lines</span>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste your JavaScript code here..."
              style={{ border: 'none', borderRadius: 0, minHeight: 300, padding: 16 }}
              spellCheck={false}
            />
          </div>
        </div>

        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Output</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{output ? output.split('\n').length : 0} lines</span>
              {output && (
                <button className="btn btn-sm" onClick={handleCopy}>
                  {copied ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
                </button>
              )}
            </div>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
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
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
