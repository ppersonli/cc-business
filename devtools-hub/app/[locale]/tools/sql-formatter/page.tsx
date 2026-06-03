'use client'
import { useState } from 'react'
import Link from 'next/link'

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

  // Add newlines before major keywords
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

  // Indent subqueries and parentheses
  const lines = result.split('\n').filter(l => l.trim())
  const formatted: string[] = []
  let indentLevel = 0
  const indentStr = ' '.repeat(indent)

  for (let line of lines) {
    line = line.trim()
    if (!line) continue

    // Count opening/closing parens for indentation
    const openParens = (line.match(/\(/g) || []).length
    const closeParens = (line.match(/\)/g) || []).length

    // Decrease indent for closing parens at start
    if (line.startsWith(')') || line.startsWith(') ')) {
      indentLevel = Math.max(0, indentLevel - 1)
    }

    formatted.push(indentStr.repeat(indentLevel) + line)

    // Increase indent for opening parens
    if (openParens > closeParens) {
      indentLevel += openParens - closeParens
    } else if (closeParens > openParens) {
      indentLevel = Math.max(0, indentLevel - (closeParens - openParens))
    }
  }

  // Uppercase keywords
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

  const handleFormat = () => {
    setOutput(formatSQL(input, indent))
  }

  const handleMinify = () => {
    setOutput(minifySQL(input))
  }

  const handleCapitalize = () => {
    setOutput(capitalizeKeywords(input))
  }

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
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-12">
      <Link href="/" className="text-blue-400 hover:underline mb-8 inline-block">
        ← Back to DevTools Hub
      </Link>
      <h1 className="text-3xl font-bold mb-2"> SQL Formatter</h1>
      <p className="text-gray-400 mb-8">Format, minify, and capitalize SQL queries with proper indentation</p>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-4 mb-4">
          <label className="text-sm text-gray-400">Indent:</label>
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="bg-gray-950 border border-gray-700 rounded px-3 py-1.5 text-white text-sm"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={1}>Tab</option>
          </select>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-gray-950 border border-gray-700 rounded p-3 text-white font-mono text-sm mb-4 h-48 resize-y"
          placeholder="Paste your SQL query here..."
          spellCheck={false}
        />

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={handleFormat}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            ✨ Format
          </button>
          <button
            onClick={handleMinify}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-medium"
          >
            ️ Minify
          </button>
          <button
            onClick={handleCapitalize}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-medium"
          >
            Aa Capitalize
          </button>
          <button
            onClick={handleClear}
            className="bg-gray-800 hover:bg-gray-700 text-gray-400 px-4 py-2 rounded text-sm"
          >
            Clear
          </button>
          {output && (
            <button
              onClick={handleCopy}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium ml-auto"
            >
              {copied ? '✓ Copied!' : ' Copy'}
            </button>
          )}
        </div>

        {output && (
          <div className="bg-gray-950 border border-gray-700 rounded p-3">
            <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap overflow-x-auto">{output}</pre>
          </div>
        )}
      </div>

      <div className="mt-8 bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-bold mb-3">About SQL Formatter</h2>
        <div className="text-gray-400 text-sm space-y-2">
          <p><strong className="text-white">Format:</strong> Adds proper indentation and newlines to make SQL readable</p>
          <p><strong className="text-white">Minify:</strong> Removes all whitespace for compact queries</p>
          <p><strong className="text-white">Capitalize:</strong> Uppercases all SQL keywords for consistent style</p>
          <p className="mt-4 text-gray-500">All processing happens in your browser. No data is sent to any server.</p>
        </div>
      </div>
    </main>
  )
}
