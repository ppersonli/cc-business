// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

'use client'

import { useEffect, useRef, useCallback } from 'react'
import { EditorView, lineNumbers, highlightActiveLine, highlightActiveLineGutter, keymap } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldGutter } from '@codemirror/language'
import { history, historyKeymap, defaultKeymap, indentWithTab } from '@codemirror/commands'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import { minimalSetup } from 'codemirror'
import { useEditorStore } from '../../../lib/wemd/stores/editorStore'
import { useSettingsStore } from '../../../lib/wemd/stores/settingsStore'

const lightTheme = EditorView.theme({
  '&': { backgroundColor: '#ffffff', color: '#1e293b', minHeight: 0 },
  '.cm-content': { fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace", fontSize: '14px', lineHeight: '1.7' },
  '.cm-gutters': { backgroundColor: '#f8fafc', color: '#94a3b8', borderRight: '1px solid #e2e8f0' },
  '.cm-activeLineGutter': { backgroundColor: '#e2e8f0' },
  '.cm-activeLine': { backgroundColor: '#f1f5f940' },
  '.cm-selectionBackground': { backgroundColor: '#c7d2fe50 !important' },
  '&.cm-focused .cm-selectionBackground': { backgroundColor: '#93c5fd40 !important' },
  '.cm-cursor': { borderLeftColor: '#3b82f6' },
  '.cm-matchingBracket': { backgroundColor: '#bfdbfe40', outline: '1px solid #93c5fd' },
  '.cm-foldGutter': { color: '#cbd5e1' },
}, { dark: false })

const darkTheme = EditorView.theme({
  '&': { backgroundColor: '#0f172a', color: '#e2e8f0', minHeight: 0 },
  '.cm-content': { fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace", fontSize: '14px', lineHeight: '1.7' },
  '.cm-gutters': { backgroundColor: '#1e293b', color: '#475569', borderRight: '1px solid #334155' },
  '.cm-activeLineGutter': { backgroundColor: '#334155' },
  '.cm-activeLine': { backgroundColor: '#1e293b40' },
  '.cm-selectionBackground': { backgroundColor: '#3b82f640 !important' },
  '&.cm-focused .cm-selectionBackground': { backgroundColor: '#3b82f650 !important' },
  '.cm-cursor': { borderLeftColor: '#60a5fa' },
  '.cm-matchingBracket': { backgroundColor: '#3b82f630', outline: '1px solid #60a5fa' },
  '.cm-foldGutter': { color: '#475569' },
}, { dark: true })

export default function CodeMirrorEditor() {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const { content, setContent, setEditorView } = useEditorStore()
  const { isDarkUI } = useSettingsStore()

  const handleChange = useCallback(
    (update: { state: EditorState; docChanged: boolean }) => {
      if (update.docChanged) {
        setContent(update.state.doc.toString())
      }
    },
    [setContent]
  )

  useEffect(() => {
    if (!containerRef.current) return

    if (viewRef.current) {
      viewRef.current.destroy()
      viewRef.current = null
    }

    const state = EditorState.create({
      doc: content,
      extensions: [
        minimalSetup,
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        bracketMatching(),
        foldGutter(),
        highlightSelectionMatches(),
        history(),
        markdown({ base: markdownLanguage }),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        EditorView.lineWrapping,
        isDarkUI ? darkTheme : lightTheme,
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...searchKeymap,
          indentWithTab,
        ]),
        EditorView.updateListener.of(handleChange),
      ],
    })

    const view = new EditorView({
      state,
      parent: containerRef.current,
    })

    viewRef.current = view
    setEditorView(view as never)

    return () => {
      view.destroy()
      viewRef.current = null
      setEditorView(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDarkUI])

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}
    />
  )
}
