'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'

interface CronField {
  name: string
  value: string
  description: string
}

const CRON_PRESETS = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every day at midnight', value: '0 0 * * *' },
  { label: 'Every day at noon', value: '0 12 * * *' },
  { label: 'Every Monday', value: '0 0 * * 1' },
  { label: 'First of every month', value: '0 0 1 * *' },
  { label: 'Every 15 minutes', value: '*/15 * * * *' },
  { label: 'Every 6 hours', value: '0 */6 * * *' },
  { label: 'Weekdays at 9am', value: '0 9 * * 1-5' },
  { label: 'Weekends at 10am', value: '0 10 * * 0,6' },
]

const MINUTE_DESCRIPTIONS: Record<string, string> = {
  '*': 'every minute',
  '*/5': 'every 5 minutes',
  '*/10': 'every 10 minutes',
  '*/15': 'every 15 minutes',
  '*/30': 'every 30 minutes',
}

function describeCronField(value: string, type: 'minute' | 'hour' | 'day' | 'month' | 'weekday'): string {
  if (value === '*') {
    return `every ${type === 'minute' ? 'minute' : type === 'hour' ? 'hour' : type === 'day' ? 'day' : type === 'month' ? 'month' : 'day of the week'}`
  }

  if (value.startsWith('*/')) {
    const n = parseInt(value.slice(2))
    if (type === 'minute') return `every ${n} minutes`
    if (type === 'hour') return `every ${n} hours`
    if (type === 'day') return `every ${n} days`
  }

  if (value.includes('-')) {
    const [start, end] = value.split('-')
    if (type === 'weekday') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      return `${days[parseInt(start)]}-${days[parseInt(end)]}`
    }
    return `${start}-${end}`
  }

  if (value.includes(',')) {
    const items = value.split(',')
    if (type === 'weekday') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      return items.map(i => days[parseInt(i)]).join(', ')
    }
    return items.join(', ')
  }

  if (type === 'weekday') {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[parseInt(value)] || value
  }

  if (type === 'month') {
    const months = ['', 'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December']
    return months[parseInt(value)] || value
  }

  return value
}

function describeCron(expr: string): string {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return 'Invalid cron expression'

  const [minute, hour, day, month, weekday] = parts
  const descriptions: string[] = []

  descriptions.push(`At ${describeCronField(minute, 'minute')}`)
  if (hour !== '*') descriptions.push(`past hour ${describeCronField(hour, 'hour')}`)
  if (day !== '*') descriptions.push(`on day ${describeCronField(day, 'day')}`)
  if (month !== '*') descriptions.push(`in ${describeCronField(month, 'month')}`)
  if (weekday !== '*') descriptions.push(`on ${describeCronField(weekday, 'weekday')}`)

  return descriptions.join(', ')
}

function getNextRuns(expr: string, count: number = 5): string[] {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return []

  const [minuteExpr, hourExpr, dayExpr, monthExpr, weekdayExpr] = parts
  const runs: string[] = []
  const now = new Date()

  let date = new Date(now)
  date.setSeconds(0)
  date.setMilliseconds(0)
  date.setMinutes(date.getMinutes() + 1)

  const maxIterations = 525600 // One year of minutes
  let iterations = 0

  while (runs.length < count && iterations < maxIterations) {
    iterations++

    if (matchesField(date.getMinutes(), minuteExpr) &&
        matchesField(date.getHours(), hourExpr) &&
        matchesField(date.getDate(), dayExpr) &&
        matchesField(date.getMonth() + 1, monthExpr) &&
        matchesField(date.getDay(), weekdayExpr)) {
      runs.push(date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }))
    }

    date.setMinutes(date.getMinutes() + 1)
  }

  return runs
}

function matchesField(value: number, expr: string): boolean {
  if (expr === '*') return true

  if (expr.startsWith('*/')) {
    const n = parseInt(expr.slice(2))
    return value % n === 0
  }

  if (expr.includes(',')) {
    return expr.split(',').some(v => matchesField(value, v.trim()))
  }

  if (expr.includes('-')) {
    const [start, end] = expr.split('-').map(Number)
    return value >= start && value <= end
  }

  return value === parseInt(expr)
}

export default function CronGenerator() {
  const [expression, setExpression] = useState('* * * * *')
  const [minute, setMinute] = useState('*')
  const [hour, setHour] = useState('*')
  const [day, setDay] = useState('*')
  const [month, setMonth] = useState('*')
  const [weekday, setWeekday] = useState('*')
  const [copied, setCopied] = useState(false)

  const cronExpr = useMemo(() => {
    return `${minute} ${hour} ${day} ${month} ${weekday}`
  }, [minute, hour, day, month, weekday])

  const description = useMemo(() => describeCron(cronExpr), [cronExpr])
  const nextRuns = useMemo(() => getNextRuns(cronExpr), [cronExpr])

  const handlePreset = (value: string) => {
    const parts = value.split(' ')
    setMinute(parts[0])
    setHour(parts[1])
    setDay(parts[2])
    setMonth(parts[3])
    setWeekday(parts[4])
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cronExpr)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-12">
      <Link href="/" className="text-blue-400 hover:underline mb-8 inline-block">
        ← Back to DevTools Hub
      </Link>
      <h1 className="text-3xl font-bold mb-2">⏰ Cron Expression Generator</h1>
      <p className="text-gray-400 mb-8">Generate and understand cron schedule expressions with human-readable descriptions</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cron Builder */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Build Expression</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Minute (0-59)</label>
              <input
                type="text"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white font-mono text-sm"
                placeholder="*"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Hour (0-23)</label>
              <input
                type="text"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white font-mono text-sm"
                placeholder="*"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Day of Month (1-31)</label>
              <input
                type="text"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white font-mono text-sm"
                placeholder="*"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Month (1-12)</label>
              <input
                type="text"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white font-mono text-sm"
                placeholder="*"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Day of Week (0-6, Sun=0)</label>
              <input
                type="text"
                value={weekday}
                onChange={(e) => setWeekday(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white font-mono text-sm"
                placeholder="*"
              />
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-950 border border-gray-700 rounded">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Expression:</span>
              <code className="text-green-400 font-mono text-lg">{cronExpr}</code>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Description */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-bold mb-3">Description</h2>
            <p className="text-white text-lg">{description}</p>
            <button
              onClick={handleCopy}
              className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
            >
              {copied ? '✓ Copied!' : ' Copy Expression'}
            </button>
          </div>

          {/* Next Runs */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-bold mb-3">Next 5 Runs</h2>
            {nextRuns.length > 0 ? (
              <ul className="space-y-2">
                {nextRuns.map((run, i) => (
                  <li key={i} className="text-gray-300 text-sm flex items-center gap-2">
                    <span className="text-blue-400">{i + 1}.</span>
                    {run}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No upcoming runs found</p>
            )}
          </div>

          {/* Presets */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-bold mb-3">Common Presets</h2>
            <div className="grid grid-cols-2 gap-2">
              {CRON_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePreset(preset.value)}
                  className={`text-left px-3 py-2 rounded text-sm transition ${
                    cronExpr === preset.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="font-medium">{preset.label}</div>
                  <div className="text-xs opacity-60 font-mono">{preset.value}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-bold mb-3">Cron Syntax Reference</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 text-gray-400">Symbol</th>
                <th className="text-left py-2 text-gray-400">Meaning</th>
                <th className="text-left py-2 text-gray-400">Example</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800">
                <td className="py-2 font-mono">*</td>
                <td>Any value</td>
                <td className="font-mono text-xs">* = every minute</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 font-mono">,</td>
                <td>List separator</td>
                <td className="font-mono text-xs">1,3,5 = 1st, 3rd, 5th</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 font-mono">-</td>
                <td>Range</td>
                <td className="font-mono text-xs">1-5 = 1 through 5</td>
              </tr>
              <tr>
                <td className="py-2 font-mono">/</td>
                <td>Step</td>
                <td className="font-mono text-xs">*/5 = every 5 units</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-gray-500 text-sm">All processing happens in your browser. No data is sent to any server.</p>
      </div>
    </main>
  )
}
