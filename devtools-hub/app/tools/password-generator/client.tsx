'use client'
import { useState, useCallback } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('password-generator')!

const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
}

function generatePassword(length: number, options: Record<string, boolean>): string {
  let chars = ''
  if (options.uppercase) chars += CHAR_SETS.uppercase
  if (options.lowercase) chars += CHAR_SETS.lowercase
  if (options.numbers) chars += CHAR_SETS.numbers
  if (options.symbols) chars += CHAR_SETS.symbols

  if (!chars) chars = CHAR_SETS.lowercase

  const array = new Uint32Array(length)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  } else {
    for (let i = 0; i < length; i++) array[i] = Math.floor(Math.random() * 4294967296)
  }

  return Array.from(array, (n) => chars[n % chars.length]).join('')
}

function calculateStrength(length: number, options: Record<string, boolean>): { label: string; score: number; color: string } {
  let poolSize = 0
  if (options.uppercase) poolSize += 26
  if (options.lowercase) poolSize += 26
  if (options.numbers) poolSize += 10
  if (options.symbols) poolSize += 30
  if (poolSize === 0) poolSize = 26

  const bits = Math.floor(length * Math.log2(poolSize))

  if (bits < 40) return { label: 'Weak', score: 1, color: '#ef4444' }
  if (bits < 60) return { label: 'Fair', score: 2, color: '#f59e0b' }
  if (bits < 80) return { label: 'Good', score: 3, color: '#22c55e' }
  if (bits < 120) return { label: 'Strong', score: 4, color: '#10b981' }
  return { label: 'Very Strong', score: 5, color: '#06b6d4' }
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16)
  const [options, setOptions] = useState<Record<string, boolean>>({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  })
  const [password, setPassword] = useState(() => generatePassword(16, { uppercase: true, lowercase: true, numbers: true, symbols: true }))
  const [copied, setCopied] = useState(false)

  const generate = useCallback(() => {
    setPassword(generatePassword(length, options))
    setCopied(false)
  }, [length, options])

  const toggleOption = useCallback((key: string) => {
    setOptions((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      const hasAny = Object.values(next).some(Boolean)
      if (!hasAny) return prev
      return next
    })
  }, [])

  const copyPassword = useCallback(() => {
    navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [password])

  const strength = calculateStrength(length, options)

  return (
    <ToolLayout tool={tool}>
      <div className="options-row" style={{ flexWrap: 'wrap' }}>
        <div className="option-group">
          <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Length: {length}
          </label>
          <input
            type="range"
            min={8}
            max={128}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            style={{ width: 160, accentColor: 'var(--accent)' }}
          />
        </div>
        {Object.entries({ uppercase: 'A-Z', lowercase: 'a-z', numbers: '0-9', symbols: '!@#' }).map(([key, label]) => (
          <button
            key={key}
            className="btn btn-sm"
            onClick={() => toggleOption(key)}
            style={{
              background: options[key] ? 'var(--accent)' : 'var(--bg-secondary)',
              color: options[key] ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${options[key] ? 'var(--accent)' : 'var(--border)'}`,
            }}
          >
            {label}
          </button>
        ))}
        <button className="btn btn-primary" onClick={generate}>
          Generate
        </button>
      </div>

      <div className="tool-panel" style={{ marginTop: 16 }}>
        <div className="panel-header">
          <span>Password</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: strength.color, fontWeight: 600 }}>
              {strength.label}
            </span>
            <button className="btn btn-sm" onClick={copyPassword}>
              {copied ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy</>}
            </button>
          </div>
        </div>
        <div className="panel-body">
          <pre style={{
            margin: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: 18,
            letterSpacing: 1,
            wordBreak: 'break-all',
            lineHeight: 1.6,
            color: 'var(--text-primary)',
          }}>
            {password}
          </pre>
        </div>
      </div>

      <div style={{
        marginTop: 12,
        display: 'flex',
        gap: 4,
      }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i <= strength.score ? strength.color : 'var(--border)',
              transition: 'background 0.2s',
            }}
          />
        ))}
      </div>

      <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
        Entropy: ~{Math.floor(length * Math.log2(
          (options.uppercase ? 26 : 0) + (options.lowercase ? 26 : 0) + (options.numbers ? 10 : 0) + (options.symbols ? 30 : 0) || 26
        ))} bits
      </div>
    </ToolLayout>
  )
}
