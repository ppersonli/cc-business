// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

'use client'

import { useState, useRef, useEffect } from 'react'
import { useSettingsStore } from '../../../lib/wemd/stores/settingsStore'

const syntaxGuide = [
  { syntax: '# Heading 1', desc: 'Heading level 1' },
  { syntax: '## Heading 2', desc: 'Heading level 2' },
  { syntax: '### Heading 3', desc: 'Heading level 3' },
  { syntax: '**bold**', desc: 'Bold text' },
  { syntax: '*italic*', desc: 'Italic text' },
  { syntax: '~~strikethrough~~', desc: 'Strikethrough' },
  { syntax: '`code`', desc: 'Inline code' },
  { syntax: '```\\ncode\\n```', desc: 'Code block' },
  { syntax: '[text](url)', desc: 'Link' },
  { syntax: '![alt](url)', desc: 'Image' },
  { syntax: '> quote', desc: 'Blockquote' },
  { syntax: '- item', desc: 'Unordered list' },
  { syntax: '1. item', desc: 'Ordered list' },
  { syntax: '- [ ] task', desc: 'Task list' },
  { syntax: '| col | col |', desc: 'Table' },
  { syntax: '---', desc: 'Horizontal rule' },
  { syntax: '==highlight==', desc: 'Highlighted text' },
  { syntax: ':emoji:', desc: 'Emoji shortcode' },
]

export default function SyntaxHelp() {
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const { isDarkUI } = useSettingsStore()

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  const bg = isDarkUI ? '#1e293b' : '#ffffff'
  const border = isDarkUI ? '#334155' : '#e2e8f0'
  const text = isDarkUI ? '#e2e8f0' : '#1e293b'
  const textMuted = isDarkUI ? '#94a3b8' : '#64748b'
  const codeBg = isDarkUI ? '#334155' : '#f1f5f9'
  const btnBg = isDarkUI ? '#334155' : '#f1f5f9'

  return (
    <div style={{ position: 'relative' }} ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Markdown Syntax Help"
        style={{
          padding: '4px 10px',
          backgroundColor: btnBg,
          border: `1px solid ${border}`,
          borderRadius: '6px',
          color: text,
          fontSize: '13px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        ?
      </button>
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            width: '340px',
            maxHeight: '480px',
            overflowY: 'auto',
            backgroundColor: bg,
            border: `1px solid ${border}`,
            borderRadius: '8px',
            boxShadow: isDarkUI ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.12)',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '14px', color: text, marginBottom: '12px' }}>
            Markdown Syntax Reference
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {syntaxGuide.map((item) => (
              <div
                key={item.syntax}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                  borderBottom: `1px solid ${border}`,
                }}
              >
                <code
                  style={{
                    fontSize: '12px',
                    fontFamily: "'SF Mono', monospace",
                    backgroundColor: codeBg,
                    padding: '2px 6px',
                    borderRadius: '3px',
                    color: text,
                  }}
                >
                  {item.syntax}
                </code>
                <span style={{ fontSize: '12px', color: textMuted, marginLeft: '8px' }}>
                  {item.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
