'use client'
import { useState, useMemo } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'

const tool = getToolBySlug('word-counter')!

interface Stats {
  chars: number
  charsNoSpaces: number
  words: number
  sentences: number
  paragraphs: number
  readingTime: string
  speakingTime: string
}

function analyze(text: string): Stats {
  if (!text.trim()) {
    return { chars: 0, charsNoSpaces: 0, words: 0, sentences: 0, paragraphs: 0, readingTime: '0s', speakingTime: '0s' }
  }

  const chars = text.length
  const charsNoSpaces = text.replace(/\s/g, '').length
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length || (text.trim() ? 1 : 0)

  const readingMinutes = words / 238
  const speakingMinutes = words / 150

  const formatTime = (minutes: number): string => {
    if (minutes < 1) return `${Math.ceil(minutes * 60)}s`
    if (minutes < 60) return `${Math.ceil(minutes)}m`
    const hrs = Math.floor(minutes / 60)
    const mins = Math.ceil(minutes % 60)
    return `${hrs}h ${mins}m`
  }

  return {
    chars,
    charsNoSpaces,
    words,
    sentences,
    paragraphs,
    readingTime: formatTime(readingMinutes),
    speakingTime: formatTime(speakingMinutes),
  }
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{
      padding: '14px 16px',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </div>
    </div>
  )
}

export default function WordCounter() {
  const [input, setInput] = useState('')

  const stats = useMemo(() => analyze(input), [input])

  return (
    <ToolLayout tool={tool}>
      <div className="tool-panel">
        <div className="panel-header">
          <span>Input Text</span>
          {input && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{input.length} chars</span>}
        </div>
        <div className="panel-body">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste your text here..."
            style={{
              width: '100%',
              minHeight: 150,
              padding: 12,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--text-primary)',
              fontSize: 14,
              resize: 'vertical',
              lineHeight: 1.6,
            }}
          />
        </div>
      </div>

      <div style={{
        marginTop: 16,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 8,
      }}>
        <StatCard label="Words" value={stats.words} />
        <StatCard label="Characters" value={stats.chars} />
        <StatCard label="No Spaces" value={stats.charsNoSpaces} />
        <StatCard label="Sentences" value={stats.sentences} />
        <StatCard label="Paragraphs" value={stats.paragraphs} />
        <StatCard label="Reading Time" value={stats.readingTime} />
        <StatCard label="Speaking Time" value={stats.speakingTime} />
      </div>

      <div style={{
        marginTop: 16,
        padding: '12px 16px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        fontSize: 12,
        color: 'var(--text-muted)',
        lineHeight: 1.6,
      }}>
        Reading time based on 238 words/min average. Speaking time based on 150 words/min average.
      </div>
    </ToolLayout>
  )
}
