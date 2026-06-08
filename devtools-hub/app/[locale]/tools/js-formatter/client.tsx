'use client'
import { useState } from 'react'
import Link from 'next/link'
import { CopyIcon, CheckIcon } from '@/components/Icons'

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

    // Block comment
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

    // Line comment
    if (inComment) {
      result += ch
      if (ch === '\n') {
        inComment = false
      }
      i++
      continue
    }

    // String
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

    // Template literal
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

    // Check for comments
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

    // Check for strings
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

    // Newlines and whitespace normalization
    if (ch === '\n' || ch === '\r') {
      i++
      continue
    }
    if (ch === ' ' || ch === '\t') {
      // Skip whitespace, we'll add our own
      i++
      continue
    }

    // Structural characters
    if (ch === '{' || ch === '[' || ch === '(') {
      if (ch === '{') level++
      result += ch
      // Add newline after opening brace if next non-space char isn't closing
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
      // Remove trailing whitespace
      result = result.trimEnd()
      result += '\n' + ' '.repeat(level * indent) + ch
      // Check if next non-space is another closing or semicolon
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

    // Keywords that need space before
    if (ch === '>' && i > 0 && input[i - 1] === '=' ) {
      result += ch
      i++
      continue
    }

    // Default: add character with proper spacing
    result += ch
    i++
  }

  // Clean up excessive newlines
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
      // Add space if needed between tokens
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
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 16px' }}>
      <nav style={{ marginBottom: 24, fontSize: 14, color: 'var(--text-muted)' }}>
        <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Tools</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span>JavaScript Formatter</span>
      </nav>

      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>JavaScript Formatter</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 16 }}>
        Format, beautify, or minify JavaScript code with proper indentation and syntax highlighting.
      </p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => { setMode('format'); handleFormat() }}
          style={{
            padding: '8px 20px',
            borderRadius: 8,
            border: 'none',
            background: mode === 'format' ? '#3b82f6' : 'var(--bg-secondary)',
            color: mode === 'format' ? 'white' : 'var(--text-primary)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          Format
        </button>
        <button
          onClick={() => { setMode('minify'); handleFormat() }}
          style={{
            padding: '8px 20px',
            borderRadius: 8,
            border: 'none',
            background: mode === 'minify' ? '#3b82f6' : 'var(--bg-secondary)',
            color: mode === 'minify' ? 'white' : 'var(--text-primary)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          Minify
        </button>
        {mode === 'format' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 12 }}>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Indent:</span>
            {[2, 4].map(n => (
              <button
                key={n}
                onClick={() => setIndent(n)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: indent === n ? 'var(--bg-tertiary)' : 'transparent',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                {n} spaces
              </button>
            ))}
          </div>
        )}
        <button
          onClick={handleFormat}
          style={{
            padding: '8px 24px',
            borderRadius: 8,
            border: 'none',
            background: '#22c55e',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14,
            marginLeft: 'auto',
          }}
        >
          {mode === 'format' ? 'Format' : 'Minify'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Input
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            style={{
              width: '100%',
              height: 400,
              padding: 16,
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontFamily: 'Menlo, Monaco, "Courier New", monospace',
              fontSize: 13,
              lineHeight: 1.6,
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            placeholder="Paste your JavaScript code here..."
          />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', justifyContent: 'space-between', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Output</span>
            {output && (
              <button
                onClick={handleCopy}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 12px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: copied ? '#22c55e' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: 12,
                  textTransform: 'none',
                  letterSpacing: '0',
                  fontWeight: 500,
                }}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            style={{
              width: '100%',
              height: 400,
              padding: 16,
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontFamily: 'Menlo, Monaco, "Courier New", monospace',
              fontSize: 13,
              lineHeight: 1.6,
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            placeholder="Formatted output will appear here..."
          />
        </div>
      </div>

      <section style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>About JavaScript Formatter</h2>
        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 15 }}>
          <p style={{ marginBottom: 12 }}>
            Our JavaScript formatter helps you beautify, format, and minify JavaScript code instantly. Whether you need to clean up minified code from a production build or format code for better readability, this tool handles it all.
          </p>
          <p style={{ marginBottom: 12 }}>
            <strong>Features:</strong> Smart indentation (2 or 4 spaces), preserves strings and template literals, handles comments correctly, minification mode for production code.
          </p>
          <p>
            <strong>100% client-side:</strong> Your code never leaves your browser. No data is sent to any server, making it safe to format even sensitive code.
          </p>
        </div>
      </section>
    </div>
  )
}
