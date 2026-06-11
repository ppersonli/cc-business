// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import { useThemeStore } from '../../../lib/wemd/stores/themeStore'
import { useSettingsStore } from '../../../lib/wemd/stores/settingsStore'

interface CustomCSSEditorProps {
  initialCSS?: string
  onApply?: (css: string) => void
}

const TEMPLATE_CSS = `/* WeMD 自定义 CSS 模板 */
/* 所有样式作用在 .wemd-preview 容器内 */

.wemd-preview {
  font-family: -apple-system, "Helvetica Neue", sans-serif;
  font-size: 15px;
  line-height: 1.75;
  color: #333333;
}

/* 标题 */
.wemd-preview h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 24px 0 16px;
}

.wemd-preview h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 20px 0 12px;
}

/* 引用 */
.wemd-preview blockquote {
  border-left: 4px solid #07c160;
  background: #f0f9eb;
  padding: 12px 16px;
  color: #6a737d;
  margin: 0 0 16px;
}

/* 代码 */
.wemd-preview code {
  font-family: "SF Mono", Consolas, monospace;
  font-size: 13px;
  background: #f6f8fa;
  padding: 2px 6px;
  border-radius: 4px;
}

.wemd-preview pre {
  background: #f6f8fa;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
}

/* 表格 */
.wemd-preview th {
  background: #f6f8fa;
  border: 1px solid #e2e8f0;
  padding: 8px 12px;
}

.wemd-preview td {
  border: 1px solid #e2e8f0;
  padding: 8px 12px;
}
`

export default function CustomCSSEditor({ initialCSS = '', onApply }: CustomCSSEditorProps) {
  const { addCustomTheme, setCurrentThemeId } = useThemeStore()
  const { isDarkUI } = useSettingsStore()
  const [css, setCss] = useState(initialCSS || TEMPLATE_CSS)
  const [themeName, setThemeName] = useState('自定义 CSS 主题')
  const [isLive, setIsLive] = useState(true)
  const [lastApplied, setLastApplied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)

  const lineCount = useMemo(() => css.split('\n').length, [css])
  const lineNumbers = useMemo(
    () => Array.from({ length: lineCount }, (_, i) => i + 1).join('\n'),
    [lineCount]
  )

  // Basic syntax highlighting stats
  const stats = useMemo(() => {
    const rules = (css.match(/\{[^}]+\}/g) || []).length
    const selectors = (css.match(/\.wemd-preview/g) || []).length
    return { rules, selectors }
  }, [css])

  const handleScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }, [])

  // Live apply
  const handleCssChange = (value: string) => {
    setCss(value)
    setLastApplied(false)
    if (isLive && onApply) {
      onApply(value)
      setLastApplied(true)
    }
  }

  const handleSave = () => {
    const id = 'custom-css-' + Date.now()
    addCustomTheme({
      id,
      name: themeName,
      css,
      isBuiltIn: false,
    })
    setCurrentThemeId(id)
    setLastApplied(true)
  }

  const handleApplyNow = () => {
    if (onApply) {
      onApply(css)
      setLastApplied(true)
    }
  }

  const handleInsertTemplate = () => {
    handleCssChange(TEMPLATE_CSS)
  }

  const text = isDarkUI ? '#e2e8f0' : '#1e293b'
  const textMuted = isDarkUI ? '#94a3b8' : '#64748b'
  const surfaceBg = isDarkUI ? '#1e293b' : '#f8fafc'
  const border = isDarkUI ? '#334155' : '#e2e8f0'
  const editorBg = isDarkUI ? '#0f172a' : '#fafafa'
  const gutterBg = isDarkUI ? '#1e293b' : '#f1f5f9'
  const gutterColor = isDarkUI ? '#475569' : '#94a3b8'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="text"
          value={themeName}
          onChange={(e) => setThemeName(e.target.value)}
          style={{
            flex: 1,
            padding: '6px 10px',
            backgroundColor: isDarkUI ? '#0f172a' : '#ffffff',
            border: `1px solid ${border}`,
            borderRadius: '6px',
            color: text,
            fontSize: '13px',
            outline: 'none',
          }}
          placeholder="主题名称"
        />
        <button
          onClick={handleInsertTemplate}
          style={{
            padding: '6px 10px',
            backgroundColor: 'transparent',
            border: `1px solid ${border}`,
            borderRadius: '6px',
            color: textMuted,
            fontSize: '12px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          插入模板
        </button>
      </div>

      {/* Editor */}
      <div
        style={{
          display: 'flex',
          border: `1px solid ${border}`,
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: editorBg,
          minHeight: '350px',
        }}
      >
        {/* Line numbers */}
        <div
          ref={lineNumbersRef}
          style={{
            width: '40px',
            padding: '12px 8px 12px 4px',
            backgroundColor: gutterBg,
            color: gutterColor,
            fontSize: '12px',
            fontFamily: "'SF Mono', 'Fira Code', Consolas, monospace",
            lineHeight: '1.6',
            textAlign: 'right',
            overflow: 'hidden',
            userSelect: 'none',
            flexShrink: 0,
            whiteSpace: 'pre',
            borderRight: `1px solid ${border}`,
          }}
        >
          {lineNumbers}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={css}
          onChange={(e) => handleCssChange(e.target.value)}
          onScroll={handleScroll}
          spellCheck={false}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: 'transparent',
            border: 'none',
            color: text,
            fontSize: '13px',
            fontFamily: "'SF Mono', 'Fira Code', Consolas, monospace",
            lineHeight: '1.6',
            resize: 'none',
            outline: 'none',
            tabSize: 2,
            whiteSpace: 'pre',
            overflowX: 'auto',
            minHeight: '350px',
          }}
        />
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: textMuted }}>
          <span>{lineCount} 行</span>
          <span>{stats.rules} 条规则</span>
          <span>{stats.selectors} 个 .wemd-preview 引用</span>
          {lastApplied && <span style={{ color: '#07c160' }}>● 已应用</span>}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: textMuted, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isLive}
              onChange={(e) => setIsLive(e.target.checked)}
              style={{ accentColor: '#07c160' }}
            />
            实时预览
          </label>
          {!isLive && (
            <button
              onClick={handleApplyNow}
              style={{
                padding: '6px 12px',
                backgroundColor: surfaceBg,
                border: `1px solid ${border}`,
                borderRadius: '6px',
                color: text,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              应用
            </button>
          )}
          <button
            onClick={handleSave}
            style={{
              padding: '6px 14px',
              backgroundColor: '#07c160',
              border: 'none',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            保存为主题
          </button>
        </div>
      </div>
    </div>
  )
}
