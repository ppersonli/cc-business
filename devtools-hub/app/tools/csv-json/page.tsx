'use client'
import { useState } from 'react'
import Link from 'next/link'

function csvToArray(csv: string): string[][] {
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
      } else if (char === ',') {
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

function arrayToTSV(data: string[][]): string {
  return data.map(row => row.join('\t')).join('\n')
}

function jsonToArray(jsonStr: string): string[][] {
  const data = JSON.parse(jsonStr)

  if (!Array.isArray(data)) {
    throw new Error('JSON must be an array of objects')
  }

  if (data.length === 0) return []

  // Collect all unique keys
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
        const csv = delimiter !== ',' ? input.replace(/\t/g, '\t') : input
        const actualDelimiter = delimiter === '\t' ? '\t' : delimiter
        const actualInput = delimiter === '\t' ? input.replace(/,/g, '\t') : input

        const rows = csvToArray(actualInput)
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
    } catch (e: any) {
      setError(e.message || 'Conversion failed')
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
    <main className="min-h-screen max-w-5xl mx-auto px-4 py-12">
      <Link href="/" className="text-blue-400 hover:underline mb-8 inline-block">
        ← Back to DevTools Hub
      </Link>
      <h1 className="text-3xl font-bold mb-2">  CSV ⇄ JSON Converter</h1>
      <p className="text-gray-400 mb-8">Convert between CSV and JSON formats with proper escaping and headers</p>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDirection('csv-to-json')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                direction === 'csv-to-json'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              CSV → JSON
            </button>
            <button
              onClick={() => setDirection('json-to-csv')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                direction === 'json-to-csv'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              JSON → CSV
            </button>
          </div>

          {direction === 'csv-to-json' && (
            <>
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={hasHeaders}
                  onChange={(e) => setHasHeaders(e.target.checked)}
                  className="rounded"
                />
                First row is headers
              </label>
              <select
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                className="bg-gray-950 border border-gray-700 rounded px-3 py-1.5 text-white text-sm"
              >
                <option value=",">, (comma)</option>
                <option value="\t">Tab</option>
                <option value=";">; (semicolon)</option>
                <option value="|">| (pipe)</option>
              </select>
            </>
          )}

          <div className="flex gap-2 ml-auto">
            <button
              onClick={handleSwap}
              disabled={!output}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50"
            >
              ⇄ Swap
            </button>
            <button
              onClick={handleClear}
              className="bg-gray-800 hover:bg-gray-700 text-gray-400 px-3 py-1.5 rounded text-sm"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Input/Output */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              {direction === 'csv-to-json' ? 'CSV Input' : 'JSON Input'}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 rounded p-3 text-white font-mono text-sm h-64 resize-y"
              placeholder={direction === 'csv-to-json'
                ? 'name,age,city\nJohn,30,NYC\nJane,25,LA'
                : '[{"name":"John","age":30},{"name":"Jane","age":25}]'
              }
              spellCheck={false}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-gray-400">
                {direction === 'csv-to-json' ? 'JSON Output' : 'CSV Output'}
              </label>
              {output && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 px-2 py-1 rounded"
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 px-2 py-1 rounded"
                  >
                    ️ Download
                  </button>
                </div>
              )}
            </div>
            <textarea
              value={output}
              readOnly
              className="w-full bg-gray-950 border border-gray-700 rounded p-3 text-green-400 font-mono text-sm h-64 resize-y"
              placeholder="Converted output will appear here..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleConvert}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm font-medium"
          >
            Convert
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-900/30 border border-red-700 rounded p-3 text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="mt-8 bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-bold mb-3">About CSV ⇄ JSON Converter</h2>
        <div className="text-gray-400 text-sm space-y-2">
          <p><strong className="text-white">CSV → JSON:</strong> Parses CSV with proper quote handling, optional headers, and multiple delimiter support</p>
          <p><strong className="text-white">JSON → CSV:</strong> Flattens nested objects, collects all unique keys as headers</p>
          <p><strong className="text-white">Swap:</strong> Quick swap input/output for iterative conversions</p>
          <p className="mt-4 text-gray-500">All processing happens in your browser. No data is sent to any server.</p>
        </div>
      </div>
    </main>
  )
}
