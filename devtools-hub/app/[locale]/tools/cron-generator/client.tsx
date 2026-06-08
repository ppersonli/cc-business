'use client'
import { useState, useMemo, useEffect } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('cron-generator')!

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

function getNextRuns(expr: string, now: Date, count: number = 5): string[] {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return []

  const [minuteExpr, hourExpr, dayExpr, monthExpr, weekdayExpr] = parts
  const runs: string[] = []

  let date = new Date(now)
  date.setSeconds(0)
  date.setMilliseconds(0)
  date.setMinutes(date.getMinutes() + 1)

  const maxIterations = 525600
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
  const [minute, setMinute] = useState('*')
  const [hour, setHour] = useState('*')
  const [day, setDay] = useState('*')
  const [month, setMonth] = useState('*')
  const [weekday, setWeekday] = useState('*')
  const [copied, setCopied] = useState(false)
  const [nextRuns, setNextRuns] = useState<string[]>([])

  const cronExpr = useMemo(() => {
    return `${minute} ${hour} ${day} ${month} ${weekday}`
  }, [minute, hour, day, month, weekday])

  const description = useMemo(() => describeCron(cronExpr), [cronExpr])

  useEffect(() => {
    setNextRuns(getNextRuns(cronExpr, new Date()))
  }, [cronExpr])

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
    <ToolLayout tool={tool}>
      <div className="tool-grid">
        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Build Expression</span>
          </div>
          <div className="panel-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Minute (0-59)</label>
                <input
                  type="text"
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  className="tool-input"
                  placeholder="*"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Hour (0-23)</label>
                <input
                  type="text"
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  className="tool-input"
                  placeholder="*"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Day of Month (1-31)</label>
                <input
                  type="text"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="tool-input"
                  placeholder="*"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Month (1-12)</label>
                <input
                  type="text"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="tool-input"
                  placeholder="*"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Day of Week (0-6, Sun=0)</label>
                <input
                  type="text"
                  value={weekday}
                  onChange={(e) => setWeekday(e.target.value)}
                  className="tool-input"
                  placeholder="*"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Expression:</span>
                <code style={{ color: 'var(--success, #22c55e)', fontFamily: 'monospace', fontSize: 16 }}>{cronExpr}</code>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="tool-panel">
            <div className="panel-header">
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Description</span>
            </div>
            <div className="panel-body">
              <p style={{ color: 'var(--text-primary)', fontSize: 16, marginBottom: 12 }}>{description}</p>
              <button className="btn btn-primary" onClick={handleCopy}>
                {copied ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy Expression</>}
              </button>
            </div>
          </div>

          <div className="tool-panel">
            <div className="panel-header">
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Next 5 Runs</span>
            </div>
            <div className="panel-body">
              {nextRuns.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {nextRuns.map((run, i) => (
                    <li key={i} style={{ fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#3b82f6', fontWeight: 600, minWidth: 20 }}>{i + 1}.</span>
                      {run}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No upcoming runs found</p>
              )}
            </div>
          </div>

          <div className="tool-panel">
            <div className="panel-header">
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Common Presets</span>
            </div>
            <div className="panel-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {CRON_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => handlePreset(preset.value)}
                    style={{
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: cronExpr === preset.value ? 'var(--accent, #3b82f6)' : 'var(--bg-primary)',
                      color: cronExpr === preset.value ? 'white' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: 13,
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{preset.label}</div>
                    <div style={{ fontSize: 11, opacity: 0.7, fontFamily: 'monospace' }}>{preset.value}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tool-panel" style={{ marginTop: 24 }}>
        <div className="panel-header">
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Cron Syntax Reference</span>
        </div>
        <div className="panel-body">
          <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '8px 0', color: 'var(--text-muted)' }}>Symbol</th>
                <th style={{ textAlign: 'left', padding: '8px 0', color: 'var(--text-muted)' }}>Meaning</th>
                <th style={{ textAlign: 'left', padding: '8px 0', color: 'var(--text-muted)' }}>Example</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 0', fontFamily: 'monospace' }}>*</td>
                <td style={{ padding: '8px 0', color: 'var(--text-secondary)' }}>Any value</td>
                <td style={{ padding: '8px 0', fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>* = every minute</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 0', fontFamily: 'monospace' }}>,</td>
                <td style={{ padding: '8px 0', color: 'var(--text-secondary)' }}>List separator</td>
                <td style={{ padding: '8px 0', fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>1,3,5 = 1st, 3rd, 5th</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 0', fontFamily: 'monospace' }}>-</td>
                <td style={{ padding: '8px 0', color: 'var(--text-secondary)' }}>Range</td>
                <td style={{ padding: '8px 0', fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>1-5 = 1 through 5</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', fontFamily: 'monospace' }}>/</td>
                <td style={{ padding: '8px 0', color: 'var(--text-secondary)' }}>Step</td>
                <td style={{ padding: '8px 0', fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>*/5 = every 5 units</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ToolLayout>
  )
}
