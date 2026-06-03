'use client'
import { useState } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('csv-json')!

function csvToArray(csv: string, delimiter: string): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentValue = ''
  let inQuotes = false

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i]
    const nextChar = csv[i + 1]

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentValue += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        currentValue += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === delimiter) {
        currentRow.push(currentValue.trim())
        currentValue = ''
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        currentRow.push(currentValue.trim())
        if (currentRow.some(c => c !== '')) {
          rows.push(currentRow)
        }
        currentRow = []
        currentValue = ''
        if (char === '\r') i++
      } else {
        currentValue += char
      }
    }
  }

  currentRow.push(currentValue.trim())
  if (currentRow.some(c => c !== '')) {
    rows.push(currentRow)
  }

  return rows
}

function arrayToCSV(data: string[][]): string {
  return data.map(row =>
    row.map(cell => {
      if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
        return `"${cell.replace(/"/g, '""')}"`
      }
      return cell
    }).join(',')
  ).join('\n')
}

function arrayToJSON(data: string[][], hasHeaders: boolean): string {
  if (data.length < 2 && hasHeaders) return '[]'

  const headers = hasHeaders ? data[0] : data[0].map((_, i) => `column_${i + 1}`)
  const rows = hasHeaders ? data.slice(1) : data

  const objects = rows.map(row => {
    const obj: Record<string, string> = {}
    headers.forEach((header, i) => {
      obj[header] = row[i] || ''
    })
    return obj
  })

  return JSON.stringify(objects, null, 2)
}

function jsonToArray(jsonStr: string): string[][] {
  const data = JSON.parse(jsonStr)

  if (!Array.isArray(data)) {
    throw new Error('JSON must be an array of objects')
  }

  if (data.length === 0) return []

  const headers = new Set<string>()
  data.forEach(item => {
    if (typeof item === 'object' && item !== null) {
      Object.keys(item).forEach(key => headers.add(key))
    }
  })

  const headerArr = Array.from(headers)
  const rows = data.map(item => {
    return headerArr.map(key => {
      const val = item[key]
      if (val === null || val === undefined) return ''
      if (typeof val === 'object') return JSON.stringify(val)
      return String(val)
    })
  })

  return [headerArr, ...rows]
}

export default function CSVJSONConverter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [hasHeaders, setHasHeaders] = useState(true)
  const [direction, setDirection] = useState<'csv-to-json' | 'json-to-csv'>('csv-to-json')
  const [copied, setCopied] = useState(false)
  const [delimiter, setDelimiter] = useState(',')

  const handleConvert = () => {
    setError('')
    setOutput('')

    try {
      if (direction === 'csv-to-json') {
        const rows = csvToArray(input, delimiter)
        if (rows.length === 0) {
          setError('No data found in input')
          return
        }
        const json = arrayToJSON(rows, hasHeaders)
        setOutput(json)
      } else {
        const data = jsonToArray(input)
        if (data.length === 0) {
          setError('No data found in JSON')
          return
        }
        const csv = arrayToCSV(data)
        setOutput(csv)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Conversion failed')
    }
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
    setError('')
  }

  const handleSwap = () => {
    if (output) {
      setInput(output)
      setOutput('')
      setDirection(d => d === 'csv-to-json' ? 'json-to-csv' : 'csv-to-json')
    }
  }

  const handleDownload = () => {
    if (!output) return
    const ext = direction === 'csv-to-json' ? 'json' : 'csv'
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `converted.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ToolLayout tool={tool}>
      <div style={{ marginBottom: 16 }}>
        <div className="options-row">
          <div className="btn-group">
            <button
              className={`btn ${direction === 'csv-to-json' ? 'btn-primary' : ''}`}
              onClick={() => setDirection('csv-to-json')}
            >
              CSV → JSON
            </button>
            <button
              className={`btn ${direction === 'json-to-csv' ? 'btn-primary' : ''}`}
              onClick={() => setDirection('json-to-csv')}
            >
              JSON → CSV
            </button>
          </div>

          {direction === 'csv-to-json' && (
            <>
              <label className="option-group" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={hasHeaders}
                  onChange={(e) => setHasHeaders(e.target.checked)}
                  style={{ marginRight: 6 }}
                />
                First row is headers
              </label>
              <div className="option-group">
                <label>Delimiter:</label>
                <select
                  value={delimiter}
                  onChange={(e) => setDelimiter(e.target.value)}
                >
                  <option value=",">, (comma)</option>
                  <option value={'\t'}>Tab</option>
                  <option value=";">; (semicolon)</option>
                  <option value="|">| (pipe)</option>
                </select>
              </div>
            </>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn" onClick={handleSwap} disabled={!output}>
              ⇄ Swap
            </button>
            <button className="btn" onClick={handleClear}>
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="tool-grid">
        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
              {direction === 'csv-to-json' ? 'CSV Input' : 'JSON Input'}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {input ? input.split('\n').length : 0} lines
            </span>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={direction === 'csv-to-json'
                ? 'name,age,city\nJohn,30,NYC\nJane,25,LA'
                : '[{"name":"John","age":30},{"name":"Jane","age":25}]'
              }
              style={{ border: 'none', borderRadius: 0, minHeight: 300, padding: 16 }}
              spellCheck={false}
            />
          </div>
        </div>

        <div className="tool-panel">
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                {direction === 'csv-to-json' ? 'JSON Output' : 'CSV Output'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {output ? output.split('\n').length : 0} lines
              </span>
              {output && (
                <>
                  <button className="btn btn-sm" onClick={handleCopy}>
                    {copied ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
                  </button>
                  <button className="btn btn-sm" onClick={handleDownload}>
                    Download
                  </button>
                </>
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
              color: error ? 'var(--error)' : undefined,
            }}>
              {error || output || <span style={{ color: 'var(--text-muted)' }}>Converted output will appear here...</span>}
            </pre>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <button className="btn btn-primary" onClick={handleConvert} style={{ padding: '8px 24px' }}>
          Convert
        </button>
      </div>
    </ToolLayout>
  )
}
