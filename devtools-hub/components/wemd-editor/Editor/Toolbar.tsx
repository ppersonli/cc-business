// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

'use client'

import type { EditorView } from '@codemirror/view'
import { useEditorStore } from '../../../lib/wemd/stores/editorStore'
import { useSettingsStore } from '../../../lib/wemd/stores/settingsStore'

interface ToolbarAction {
  label: string
  icon: string
  action: (view: EditorView) => void
}

interface ToolbarProps {
  onToggleSearch?: () => void
}

function insertAround(before: string, after: string) {
  return (view: EditorView) => {
    const { from, to } = view.state.selection.main
    const selected = view.state.doc.sliceString(from, to)
    const text = selected || 'text'
    view.dispatch({
      changes: { from, to, insert: `${before}${text}${after}` },
      selection: { anchor: from + before.length + text.length + after.length },
    })
  }
}

function insertAtLineStart(prefix: string) {
  return (view: EditorView) => {
    const pos = view.state.selection.main.from
    const line = view.state.doc.lineAt(pos)
    const lineText = line.text
    const from = line.from
    const to = line.to

    if (lineText.startsWith(prefix)) {
      view.dispatch({
        changes: { from, to, insert: lineText.slice(prefix.length) },
      })
    } else {
      view.dispatch({
        changes: { from, to, insert: prefix + lineText },
      })
    }
  }
}

function insertBlock(text: string) {
  return (view: EditorView) => {
    const { from } = view.state.selection.main
    view.dispatch({
      changes: { from, to: from, insert: text },
      selection: { anchor: from + text.length },
    })
  }
}

const actions: ToolbarAction[] = [
  { label: '加粗', icon: 'B', action: insertAround('**', '**') },
  { label: '斜体', icon: 'I', action: insertAround('*', '*') },
  { label: '删除线', icon: 'S', action: insertAround('~~', '~~') },
  { label: '高亮', icon: 'H', action: insertAround('==', '==') },
  { label: 'Heading 1', icon: 'H1', action: insertAtLineStart('# ') },
  { label: 'Heading 2', icon: 'H2', action: insertAtLineStart('## ') },
  { label: 'Heading 3', icon: 'H3', action: insertAtLineStart('### ') },
  { label: '行内代码', icon: '</>', action: insertAround('`', '`') },
  { label: '代码块', icon: '{}', action: insertBlock('\n```\n\n```\n') },
  { label: '链接', icon: '🔗', action: insertAround('[', '](url)') },
  { label: '图片', icon: '🖼', action: insertBlock('![alt](url)') },
  { label: '引用', icon: '❝', action: insertAtLineStart('> ') },
  { label: '无序列表', icon: '•', action: insertAtLineStart('- ') },
  { label: '有序列表', icon: '1.', action: insertAtLineStart('1. ') },
  { label: '任务列表', icon: '☑', action: insertAtLineStart('- [ ] ') },
  { label: '表格', icon: '⊞', action: insertBlock('\n| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |\n') },
  { label: '分割线', icon: '—', action: insertBlock('\n---\n') },
  { label: '数学公式', icon: '∑', action: insertBlock('\n$$\nE = mc^2\n$$\n') },
  { label: 'Mermaid', icon: '◈', action: insertBlock('\n```mermaid\ngraph TD\n    A-->B\n```\n') },
  { label: '目录', icon: '📑', action: insertBlock('\n[toc]\n') },
  { label: '脚注', icon: '¹', action: insertBlock('[^1]') },
]

export default function Toolbar({ onToggleSearch }: ToolbarProps) {
  const { editorView } = useEditorStore()
  const { isDarkUI } = useSettingsStore()

  const handleClick = (action: ToolbarAction) => {
    if (!editorView) return
    action.action(editorView as unknown as EditorView)
    editorView.focus()
  }

  const bg = isDarkUI ? '#1e293b' : '#f8fafc'
  const border = isDarkUI ? '#334155' : '#e2e8f0'
  const btnBg = isDarkUI ? '#334155' : '#ffffff'
  const btnHover = isDarkUI ? '#475569' : '#f1f5f9'
  const text = isDarkUI ? '#e2e8f0' : '#1e293b'

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'nowrap',
        gap: '3px',
        padding: '6px 8px',
        backgroundColor: bg,
        borderBottom: `1px solid ${border}`,
        alignItems: 'center',
        flexShrink: 0,
        overflowX: 'auto',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {onToggleSearch && (
        <button
          onClick={onToggleSearch}
          title="搜索替换 (Ctrl+F)"
          style={{
            padding: '4px 7px',
            backgroundColor: btnBg,
            border: `1px solid ${border}`,
            borderRadius: '4px',
            color: text,
            fontSize: '12px',
            cursor: 'pointer',
            lineHeight: '1.4',
            minWidth: '26px',
            textAlign: 'center' as const,
            transition: 'background-color 0.15s',
            flexShrink: 0,
            marginRight: '4px',
            fontWeight: 600,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = btnHover }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = btnBg }}
        >
          🔍
        </button>
      )}
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => handleClick(action)}
          title={action.label}
          style={{
            padding: '4px 7px',
            backgroundColor: btnBg,
            border: `1px solid ${border}`,
            borderRadius: '4px',
            color: text,
            fontSize: action.icon.length > 2 ? '11px' : '12px',
            fontWeight: action.icon === 'B' ? 700 : action.icon === 'I' ? 500 : 400,
            fontStyle: action.icon === 'I' ? 'italic' : 'normal',
            cursor: 'pointer',
            fontFamily: action.icon.length <= 2 && !['∑', '◈', '¹', '🖼', '❝', '☑', '⊞'].includes(action.icon) ? "'SF Mono', monospace" : 'inherit',
            lineHeight: '1.4',
            minWidth: '26px',
            textAlign: 'center' as const,
            transition: 'background-color 0.15s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = btnHover
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = btnBg
          }}
        >
          {action.icon}
        </button>
      ))}
    </div>
  )
}
