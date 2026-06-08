'use client'
import { useState } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('sql-formatter')!

function formatSQL(input: string, indent: number = 2): string {
  if (!input.trim()) return ''

  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY',
    'HAVING', 'LIMIT', 'OFFSET', 'INSERT INTO', 'VALUES', 'UPDATE',
    'SET', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE',
    'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN',
    'ON', 'AS', 'IN', 'NOT IN', 'EXISTS', 'NOT EXISTS', 'BETWEEN',
    'LIKE', 'IS NULL', 'IS NOT NULL', 'UNION', 'UNION ALL',
    'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'DISTINCT', 'COUNT',
    'SUM', 'AVG', 'MIN', 'MAX', 'ASC', 'DESC', 'NULLS FIRST',
    'NULLS LAST', 'WITH', 'RECURSIVE', 'PARTITION BY', 'OVER',
    'FETCH', 'NEXT', 'ROWS', 'ONLY', 'FIRST', 'PERCENT',
    'CROSS JOIN', 'NATURAL JOIN', 'USING', 'TOP', 'INTO',
    'CREATE INDEX', 'DROP INDEX', 'TRUNCATE', 'GRANT', 'REVOKE',
  ]

  let result = input
    .replace(/\s+/g, ' ')
    .trim()

  const majorKeywords = [
    'SELECT', 'FROM', 'WHERE', 'ORDER BY', 'GROUP BY', 'HAVING',
    'LIMIT', 'OFFSET', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET',
    'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE',
    'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN',
    'CROSS JOIN', 'NATURAL JOIN', 'UNION', 'UNION ALL', 'WITH',
    'ON', 'AND', 'OR', 'FETCH', 'INTO',
  ]

  for (const kw of majorKeywords) {
    const regex = new RegExp(`\\b(${kw})\\b`, 'gi')
    result = result.replace(regex, `\n$1`)
  }

  const lines = result.split('\n').filter(l => l.trim())
  const formatted: string[] = []
  let indentLevel = 0
  const indentStr = ' '.repeat(indent)

  for (let line of lines) {
    line = line.trim()
    if (!line) continue

    const openParens = (line.match(/\(/g) || []).length
    const closeParens = (line.match(/\)/g) || []).length

    if (line.startsWith(')') || line.startsWith(') ')) {
      indentLevel = Math.max(0, indentLevel - 1)
    }

    formatted.push(indentStr.repeat(indentLevel) + line)

    if (openParens > closeParens) {
      indentLevel += openParens - closeParens
    } else if (closeParens > openParens) {
      indentLevel = Math.max(0, indentLevel - (closeParens - openParens))
    }
  }

  let output = formatted.join('\n')
  for (const kw of keywords) {
    const regex = new RegExp(`\\b${kw.replace(/ /g, '\\s+')}\\b`, 'gi')
    output = output.replace(regex, kw)
  }

  return output
}

function minifySQL(input: string): string {
  return input
    .replace(/\s+/g, ' ')
    .replace(/\s*([(),;])\s*/g, '$1')
    .trim()
}

function capitalizeKeywords(input: string): string {
  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY',
    'HAVING', 'LIMIT', 'OFFSET', 'INSERT', 'INTO', 'VALUES', 'UPDATE',
    'SET', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'TABLE', 'INDEX',
    'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'AS', 'IN',
    'NOT', 'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'NULL', 'UNION', 'ALL',
    'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'DISTINCT', 'COUNT',
    'SUM', 'AVG', 'MIN', 'MAX', 'ASC', 'DESC', 'WITH', 'RECURSIVE',
    'PARTITION', 'OVER', 'FETCH', 'NEXT', 'ROWS', 'ONLY', 'FIRST',
    'PERCENT', 'CROSS', 'NATURAL', 'USING', 'TOP', 'INTO',
  ]

  let result = input
  for (const kw of keywords) {
    const regex = new RegExp(`\\b${kw}\\b`, 'gi')
    result = result.replace(regex, kw)
  }
  return result
}

export default function SQLFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [indent, setIndent] = useState(2)
  const [copied, setCopied] = useState(false)

  const handleFormat = () => setOutput(formatSQL(input, indent))
  const handleMinify = () => setOutput(minifySQL(input))
  const handleCapitalize = () => setOutput(capitalizeKeywords(input))

  const handleCopy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
  }

  return (
    <ToolLayout tool={tool}>
      <div style={{ marginBottom: 16 }}>
        <div className="options-row">
          <div className="option-group">
            <label>Indent:</label>
            <select value={indent} onChange={(e) => setIndent(Number(e.target.value))}>
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
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{input ? input.split('\n').length : 0} lines</span>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ border: 'none', borderRadius: 0, minHeight: 200, padding: 16 }}
              placeholder="Paste your SQL query here..."
              spellCheck={false}
            />
          </div>
        </div>

        <div className="tool-panel">
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Output</span>
              {output && <span className="status-badge status-valid">Formatted</span>}
            </div>
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
              minHeight: 200,
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

      <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={handleFormat}>Format</button>
        <button className="btn" onClick={handleMinify}>Minify</button>
        <button className="btn" onClick={handleCapitalize}>Capitalize</button>
        <button className="btn" onClick={handleClear}>Clear</button>
      </div>
    </ToolLayout>
  )
}
