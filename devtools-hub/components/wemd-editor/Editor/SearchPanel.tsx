// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { EditorView } from '@codemirror/view'
import { useEditorStore } from '../../../lib/wemd/stores/editorStore'
import { useSettingsStore } from '../../../lib/wemd/stores/settingsStore'

interface SearchPanelProps {
  isOpen: boolean
  onClose: () => void
}

interface Match {
  from: number
  to: number
}

function findMatches(
  doc: string,
  query: string,
  options: { caseSensitive: boolean; regex: boolean; wholeWord: boolean }
): Match[] {
  if (!query) return []

  const matches: Match[] = []
  let pattern: RegExp

  try {
    let escaped = query
    if (!options.regex) {
      escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }
    if (options.wholeWord) {
      escaped = `\\b${escaped}\\b`
    }
    pattern = new RegExp(escaped, options.caseSensitive ? 'g' : 'gi')
  } catch {
    return [] // invalid regex
  }

  let m: RegExpExecArray | null
  const maxMatches = 5000
  while ((m = pattern.exec(doc)) !== null) {
    if (m[0].length === 0) {
      pattern.lastIndex++
      continue
    }
    matches.push({ from: m.index, to: m.index + m[0].length })
    if (matches.length >= maxMatches) break
  }

  return matches
}

export default function SearchPanel({ isOpen, onClose }: SearchPanelProps) {
  const { editorView, content } = useEditorStore()
  const { isDarkUI } = useSettingsStore()
  const [searchText, setSearchText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [useRegex, setUseRegex] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const [showReplace, setShowReplace] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const matches = findMatches(content, searchText, { caseSensitive, regex: useRegex, wholeWord })
  const totalMatches = matches.length

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
      // Pre-fill with current selection
      const view = editorView as unknown as EditorView | null
      if (view) {
        const { from, to } = view.state.selection.main
        if (from !== to) {
          const selected = view.state.doc.sliceString(from, to)
          if (selected && !selected.includes('\n')) {
            setSearchText(selected)
          }
        }
      }
    }
  }, [isOpen, editorView])

  // Reset current match index when search changes
  useEffect(() => {
    setCurrentMatchIndex(0)
  }, [searchText, caseSensitive, useRegex, wholeWord])

  // Highlight current match in editor
  useEffect(() => {
    if (!editorView || totalMatches === 0) return
    const view = editorView as unknown as EditorView
    const match = matches[currentMatchIndex]
    if (match) {
      view.dispatch({
        selection: { anchor: match.from, head: match.to },
        scrollIntoView: true,
      })
    }
  }, [currentMatchIndex, editorView, matches, totalMatches])

  const goToNext = useCallback(() => {
    if (totalMatches === 0) return
    setCurrentMatchIndex((i) => (i + 1) % totalMatches)
  }, [totalMatches])

  const goToPrev = useCallback(() => {
    if (totalMatches === 0) return
    setCurrentMatchIndex((i) => (i - 1 + totalMatches) % totalMatches)
  }, [totalMatches])

  const doReplace = useCallback(() => {
    if (!editorView || totalMatches === 0) return
    const view = editorView as unknown as EditorView
    const match = matches[currentMatchIndex]
    if (match) {
      view.dispatch({
        changes: { from: match.from, to: match.to, insert: replaceText },
      })
      // After replace, move to next match
      if (matches.length > 1) {
        goToNext()
      }
    }
  }, [editorView, matches, currentMatchIndex, replaceText, totalMatches, goToNext])

  const doReplaceAll = useCallback(() => {
    if (!editorView || totalMatches === 0) return
    const view = editorView as unknown as EditorView
    // Replace from end to start to preserve positions
    const sortedMatches = [...matches].sort((a, b) => b.from - a.from)
    const changes = sortedMatches.map((m) => ({
      from: m.from,
      to: m.to,
      insert: replaceText,
    }))
    view.dispatch({ changes })
  }, [editorView, matches, replaceText, totalMatches])

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (e.shiftKey) {
          goToPrev()
        } else {
          goToNext()
        }
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    },
    [goToNext, goToPrev, onClose]
  )

  if (!isOpen) return null

  const bg = isDarkUI ? '#1e293b' : '#ffffff'
  const border = isDarkUI ? '#334155' : '#e2e8f0'
  const text = isDarkUI ? '#e2e8f0' : '#1e293b'
  const textMuted = isDarkUI ? '#94a3b8' : '#64748b'
  const inputBg = isDarkUI ? '#0f172a' : '#f8fafc'
  const btnBg = isDarkUI ? '#334155' : '#f1f5f9'
  const btnHover = isDarkUI ? '#475569' : '#e2e8f0'
  const accentBg = isDarkUI ? '#3b82f6' : '#07c160'
  const toggleActive = isDarkUI ? '#3b82f6' : '#07c160'

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: '6px 10px',
    backgroundColor: inputBg,
    border: `1px solid ${border}`,
    borderRadius: '6px',
    color: text,
    fontSize: '13px',
    outline: 'none',
    minWidth: 0,
  }

  const smallBtnStyle: React.CSSProperties = {
    padding: '4px 8px',
    backgroundColor: btnBg,
    border: `1px solid ${border}`,
    borderRadius: '4px',
    color: text,
    fontSize: '12px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  }

  const toggleBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '3px 8px',
    backgroundColor: active ? toggleActive : btnBg,
    border: `1px solid ${active ? 'transparent' : border}`,
    borderRadius: '4px',
    color: active ? '#ffffff' : textMuted,
    fontSize: '11px',
    cursor: 'pointer',
    fontWeight: active ? 600 : 400,
  })

  return (
    <div
      style={{
        backgroundColor: bg,
        borderBottom: `1px solid ${border}`,
        padding: '8px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        flexShrink: 0,
      }}
      onKeyDown={handleKeyDown}
    >
      {/* Search row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={searchInputRef}
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="搜索..."
          style={inputStyle}
        />
        <span style={{ fontSize: '12px', color: textMuted, whiteSpace: 'nowrap', minWidth: '60px', textAlign: 'center' }}>
          {searchText ? (totalMatches > 0 ? `${currentMatchIndex + 1} / ${totalMatches}` : '无结果') : ''}
        </span>
        <button onClick={goToPrev} style={smallBtnStyle} title="上一个 (Shift+Enter)"
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = btnHover }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = btnBg }}
        >↑</button>
        <button onClick={goToNext} style={smallBtnStyle} title="下一个 (Enter)"
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = btnHover }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = btnBg }}
        >↓</button>
        <button
          onClick={() => setShowReplace(!showReplace)}
          style={{ ...smallBtnStyle, fontSize: '11px' }}
          title="展开/收起替换"
        >
          {showReplace ? '▲' : '▼'}
        </button>
        <button
          onClick={onClose}
          style={{ ...smallBtnStyle, padding: '3px 6px' }}
          title="关闭 (Esc)"
        >
          ✕
        </button>
      </div>

      {/* Options row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button onClick={() => setCaseSensitive(!caseSensitive)} style={toggleBtnStyle(caseSensitive)} title="区分大小写">Aa</button>
        <button onClick={() => setWholeWord(!wholeWord)} style={toggleBtnStyle(wholeWord)} title="全词匹配">W</button>
        <button onClick={() => setUseRegex(!useRegex)} style={toggleBtnStyle(useRegex)} title="正则表达式">.*</button>
      </div>

      {/* Replace row */}
      {showReplace && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
          <input
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder="替换为..."
            style={inputStyle}
          />
          <button
            onClick={doReplace}
            style={{ ...smallBtnStyle, backgroundColor: accentBg, color: '#fff', border: 'none' }}
            title="替换当前"
          >
            替换
          </button>
          <button
            onClick={doReplaceAll}
            style={{ ...smallBtnStyle, backgroundColor: accentBg, color: '#fff', border: 'none' }}
            title="全部替换"
          >
            全部替换
          </button>
        </div>
      )}
    </div>
  )
}
