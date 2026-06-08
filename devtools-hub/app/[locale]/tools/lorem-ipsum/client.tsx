'use client'
import { useState, useCallback } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import { CopyIcon, CheckIcon } from '@/components/Icons'

const tool = getToolBySlug('lorem-ipsum')!

const LOREM_WORDS = [
  'ad', 'adipiscing', 'aliqua', 'aliquip', 'amet', 'anim', 'aute', 'blandit',
  'cillum', 'commodo', 'consectetur', 'consequat', 'culpa', 'cupidatat', 'deserunt',
  'do', 'dolor', 'dolore', 'duis', 'ea', 'eiusmod', 'elit', 'enim', 'esse',
  'est', 'et', 'eu', 'ex', 'excepteur', 'exercitation', 'fugiat', 'id', 'in',
  'incididunt', 'ipsum', 'irure', 'labore', 'laboris', 'laborum', 'lorem',
  'magna', 'minim', 'mollit', 'nisi', 'non', 'nostrud', 'nulla', 'occaecat',
  'officia', 'pariatur', 'proident', 'qui', 'quis', 'reprehenderit', 'sed',
  'sint', 'sit', 'sunt', 'tempor', 'ullamco', 'ut', 'velit', 'veniam', 'voluptate',
  'a', 'ac', 'accumsan', 'adipisci', 'alias', 'aliquam', 'aliquet', 'ante',
  'aptent', 'arcu', 'at', 'auctor', 'augue', 'bibendum', 'blanditiis', 'class',
  'comis', 'condimentum', 'congue', 'convallis', 'cras', 'cubilia', 'curabitur',
  'curae', 'cursus', 'dapibus', 'diam', 'dictum', 'dictumst', 'dignissim',
  'dis', 'donec', 'dui', 'egestas', 'eget', 'eleifend', 'elementum', 'eros',
  'error', 'etiam', 'euismod', 'facilisi', 'facilisis', 'fames', 'faucibus',
  'felis', 'fermentum', 'feugiat', 'fringilla', 'fusce', 'gravida', 'habitasse',
  'hac', 'hendrerit', 'hymenaeos', 'iaculis', 'imperdiet', 'integer', 'interdum',
  'justo', 'lacinia', 'lacus', 'laoreet', 'lectus', 'leo', 'libero', 'ligula',
  'litora', 'lobortis', 'luctus', 'maecenas', 'magnis', 'malesuada', 'massa',
  'mattis', 'mauris', 'metus', 'mi', 'montes', 'morbi', 'mus', 'nam', 'nascetur',
  'natoque', 'nec', 'neque', 'netus', 'nibh', 'nisl', 'nostra', 'nullam',
  'nunc', 'odio', 'orci', 'ornare', 'parturient', 'pellentesque', 'penatibus',
  'pharetra', 'phasellus', 'placerat', 'platea', 'porta', 'porttitor', 'posuere',
  'potenti', 'praesent', 'pretium', 'primis', 'pulvinar', 'purus', 'quam',
  'risus', 'rhoncus', 'rutrum', 'sagittis', 'sapien', 'scelerisque', 'sem',
  'semper', 'senectus', 'sociis', 'sociosqu', 'sodales', 'sollicitudin',
  'suscipit', 'suspendisse', 'tellus', 'tempus', 'tincidunt', 'torquent',
  'tortor', 'tristique', 'turpis', 'ullamcorper', 'ultrices', 'ultricies',
  'urna', 'varius', 'vehicula', 'vestibulum', 'vitae', 'vivamus', 'viverra',
  'volutpat', 'vulputate',
]

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateSentence(minWords: number, maxWords: number): string {
  const count = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords
  const words = Array.from({ length: count }, () => pickRandom(LOREM_WORDS))
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1)
  return words.join(' ') + '.'
}

function generateParagraph(minWords: number, maxWords: number, startWithLorem: boolean, isFirst: boolean): string {
  const sentenceCount = Math.floor(Math.random() * 4) + 3
  const sentences: string[] = []

  for (let i = 0; i < sentenceCount; i++) {
    if (i === 0 && isFirst && startWithLorem) {
      const extra = generateSentence(minWords, maxWords).slice(1)
      sentences.push('Lorem ipsum dolor sit amet, consectetur adipiscing elit.' + extra)
    } else {
      sentences.push(generateSentence(minWords, maxWords))
    }
  }

  return sentences.join(' ')
}

interface Preset {
  name: string
  paragraphs: number
  minWords: number
  maxWords: number
}

const presets: Preset[] = [
  { name: 'Blog Post', paragraphs: 5, minWords: 8, maxWords: 15 },
  { name: 'Short Article', paragraphs: 3, minWords: 10, maxWords: 18 },
  { name: 'Email Body', paragraphs: 2, minWords: 6, maxWords: 12 },
  { name: 'Product Description', paragraphs: 1, minWords: 15, maxWords: 25 },
  { name: 'Long Form', paragraphs: 10, minWords: 12, maxWords: 20 },
]

export default function LoremIpsumGenerator() {
  const [paragraphs, setParagraphs] = useState(3)
  const [minWords, setMinWords] = useState(8)
  const [maxWords, setMaxWords] = useState(15)
  const [startWithLorem, setStartWithLorem] = useState(true)
  const [htmlOutput, setHtmlOutput] = useState(false)
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const generate = useCallback(() => {
    const paras = Array.from({ length: paragraphs }, (_, i) =>
      generateParagraph(minWords, maxWords, startWithLorem, i === 0)
    )

    if (htmlOutput) {
      setOutput(paras.map(p => `<p>${p}</p>`).join('\n'))
    } else {
      setOutput(paras.join('\n\n'))
    }
  }, [paragraphs, minWords, maxWords, startWithLorem, htmlOutput])

  const handleCopy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!output) return
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'lorem-ipsum.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const loadPreset = (preset: Preset) => {
    setParagraphs(preset.paragraphs)
    setMinWords(preset.minWords)
    setMaxWords(preset.maxWords)
  }

  const wordCount = output ? output.replace(/<[^>]+>/g, '').trim().split(/\s+/).filter(Boolean).length : 0

  return (
    <ToolLayout tool={tool}>
      <div style={{ display: 'grid', gap: 24, maxWidth: 900 }}>
        {/* Settings */}
        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Settings</span>
          </div>
          <div className="panel-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Paragraphs: {paragraphs}
                </label>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={paragraphs}
                  onChange={e => setParagraphs(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent)' }}
                />
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={paragraphs}
                  onChange={e => setParagraphs(Math.max(1, Math.min(100, Number(e.target.value))))}
                  style={{ width: '100%', marginTop: 4, padding: '6px 10px', fontSize: 13, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Min words/sentence: {minWords}
                </label>
                <input
                  type="range"
                  min={3}
                  max={25}
                  value={minWords}
                  onChange={e => {
                    const v = Number(e.target.value)
                    setMinWords(v)
                    if (v > maxWords) setMaxWords(v)
                  }}
                  style={{ width: '100%', accentColor: 'var(--accent)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Max words/sentence: {maxWords}
                </label>
                <input
                  type="range"
                  min={3}
                  max={30}
                  value={maxWords}
                  onChange={e => {
                    const v = Number(e.target.value)
                    setMaxWords(v)
                    if (v < minWords) setMinWords(v)
                  }}
                  style={{ width: '100%', accentColor: 'var(--accent)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={startWithLorem}
                  onChange={e => setStartWithLorem(e.target.checked)}
                  style={{ accentColor: 'var(--accent)' }}
                />
                Start with &quot;Lorem ipsum dolor sit amet...&quot;
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={htmlOutput}
                  onChange={e => setHtmlOutput(e.target.checked)}
                  style={{ accentColor: 'var(--accent)' }}
                />
                HTML output (&lt;p&gt; tags)
              </label>
            </div>
          </div>
        </div>

        {/* Presets */}
        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Presets</span>
          </div>
          <div className="panel-body">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {presets.map(p => (
                <button key={p.name} className="btn btn-sm" onClick={() => loadPreset(p)}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate button */}
        <button
          className="btn btn-primary"
          onClick={generate}
          style={{
            padding: '12px 24px',
            fontSize: 15,
            fontWeight: 600,
            borderRadius: 10,
            width: '100%',
          }}
        >
          Generate Lorem Ipsum
        </button>

        {/* Output */}
        {output && (
          <div className="tool-panel">
            <div className="panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Output</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{wordCount} words</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-sm"
                  onClick={handleDownload}
                  style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  Download .txt
                </button>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={handleCopy}
                  style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  {copied ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
                </button>
              </div>
            </div>
            <div className="panel-body">
              <textarea
                readOnly
                value={output}
                style={{
                  width: '100%',
                  minHeight: 240,
                  padding: 14,
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  lineHeight: 1.7,
                  resize: 'vertical',
                  fontFamily: htmlOutput ? 'monospace' : 'inherit',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
