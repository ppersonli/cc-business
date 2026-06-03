// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

'use client'

import { useState } from 'react'
import { useThemeStore } from '../../../lib/wemd/stores/themeStore'
import { useSettingsStore } from '../../../lib/wemd/stores/settingsStore'
import { builtInThemes } from '../../../lib/wemd/themes'
import type { Theme } from '../../../lib/wemd/types'

interface ThemePanelProps {
  isOpen: boolean
  onClose: () => void
}

const SAMPLE_HTML = `<h3 style="margin:0 0 8px">Heading</h3><p style="margin:0 0 6px">Body text with <strong>bold</strong> and <em>italic</em>.</p><pre class="hljs" style="margin:0;padding:6px;border-radius:4px;font-size:11px"><code>code()</code></pre>`

type TabKey = 'themes' | 'css' | 'designer'

const DESIGN_SECTIONS = [
  { key: 'global', label: '全局' },
  { key: 'heading', label: '标题' },
  { key: 'paragraph', label: '段落' },
  { key: 'quote', label: '引用' },
  { key: 'list', label: '列表' },
  { key: 'code', label: '代码' },
  { key: 'image', label: '图片' },
  { key: 'table', label: '表格' },
  { key: 'mermaid', label: 'Mermaid' },
  { key: 'other', label: '其他' },
]

export default function ThemePanel({ isOpen, onClose }: ThemePanelProps) {
  const { currentThemeId, setCurrentThemeId, customThemes, addCustomTheme } = useThemeStore()
  const { isDarkUI } = useSettingsStore()
  const [activeTab, setActiveTab] = useState<TabKey>('themes')
  const [customCSS, setCustomCSS] = useState('')
  const [designSection, setDesignSection] = useState('global')

  if (!isOpen) return null

  const bg = isDarkUI ? '#0f172a' : '#ffffff'
  const surfaceBg = isDarkUI ? '#1e293b' : '#f8fafc'
  const border = isDarkUI ? '#334155' : '#e2e8f0'
  const text = isDarkUI ? '#e2e8f0' : '#1e293b'
  const textMuted = isDarkUI ? '#94a3b8' : '#64748b'
  const activeBg = isDarkUI ? '#1e3a5f' : '#e0f2fe'
  const activeBorder = isDarkUI ? '#3b82f6' : '#0284c7'
  const inputBg = isDarkUI ? '#0f172a' : '#ffffff'

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'themes', label: '主题选择' },
    { key: 'css', label: '自定义 CSS' },
    { key: 'designer', label: '可视化设计' },
  ]

  const handleSaveCSS = () => {
    if (!customCSS.trim()) return
    const id = 'custom-' + Date.now()
    addCustomTheme({
      id,
      name: '自定义主题',
      css: customCSS,
      isBuiltIn: false,
    })
    setCurrentThemeId(id)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 998,
        }}
      />
      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '420px',
          maxWidth: '90vw',
          backgroundColor: bg,
          borderLeft: `1px solid ${border}`,
          boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: `1px solid ${border}`,
          }}
        >
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: text }}>
            主题管理
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: '4px 8px',
              backgroundColor: 'transparent',
              border: 'none',
              color: textMuted,
              fontSize: '20px',
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: `1px solid ${border}`,
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: '10px 0',
                backgroundColor: activeTab === tab.key ? activeBg : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.key ? `2px solid ${activeBorder}` : '2px solid transparent',
                color: activeTab === tab.key ? activeBorder : textMuted,
                fontSize: '13px',
                fontWeight: activeTab === tab.key ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {activeTab === 'themes' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignContent: 'start' }}>
              {builtInThemes.map((theme) => {
                const isActive = theme.id === currentThemeId
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setCurrentThemeId(theme.id)
                      onClose()
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      padding: '12px',
                      backgroundColor: isActive ? activeBg : surfaceBg,
                      border: `2px solid ${isActive ? activeBorder : border}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left' as const,
                      transition: 'all 0.15s',
                    }}
                  >
                    <div
                      style={{
                        borderRadius: '4px',
                        overflow: 'hidden',
                        border: `1px solid ${border}`,
                        fontSize: '10px',
                        minHeight: '80px',
                      }}
                    >
                      <style dangerouslySetInnerHTML={{ __html: theme.css }} />
                      <div
                        className="wemd-preview"
                        style={{ padding: '8px', fontSize: '10px', lineHeight: 1.4 }}
                        dangerouslySetInnerHTML={{ __html: SAMPLE_HTML }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? activeBorder : text,
                      }}
                    >
                      {theme.name}
                    </span>
                  </button>
                )
              })}
              {customThemes.map((theme) => {
                const isActive = theme.id === currentThemeId
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setCurrentThemeId(theme.id)
                      onClose()
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      padding: '12px',
                      backgroundColor: isActive ? activeBg : surfaceBg,
                      border: `2px solid ${isActive ? activeBorder : border}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left' as const,
                    }}
                  >
                    <div style={{ fontSize: '11px', color: textMuted, minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      自定义样式
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: isActive ? 600 : 400, color: isActive ? activeBorder : text }}>
                      {theme.name}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {activeTab === 'css' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: textMuted }}>
                编写自定义 CSS 来覆盖主题样式。样式将应用到 .wemd-preview 容器。
              </p>
              <textarea
                value={customCSS}
                onChange={(e) => setCustomCSS(e.target.value)}
                placeholder={`.wemd-preview {\n  font-family: "Helvetica Neue", sans-serif;\n}\n\n.wemd-preview h1 {\n  color: #333;\n}`}
                style={{
                  width: '100%',
                  minHeight: '300px',
                  padding: '12px',
                  backgroundColor: inputBg,
                  border: `1px solid ${border}`,
                  borderRadius: '6px',
                  color: text,
                  fontSize: '13px',
                  fontFamily: "'SF Mono', monospace",
                  lineHeight: 1.6,
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                onClick={handleSaveCSS}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#07c160',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                保存并应用
              </button>
            </div>
          )}

          {activeTab === 'designer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: textMuted }}>
                可视化调整各元素样式。
              </p>
              {/* Section selector */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {DESIGN_SECTIONS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setDesignSection(s.key)}
                    style={{
                      padding: '4px 10px',
                      backgroundColor: designSection === s.key ? activeBg : surfaceBg,
                      border: `1px solid ${designSection === s.key ? activeBorder : border}`,
                      borderRadius: '4px',
                      color: designSection === s.key ? activeBorder : text,
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: designSection === s.key ? 600 : 400,
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Designer controls */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: surfaceBg,
                  border: `1px solid ${border}`,
                  borderRadius: '8px',
                }}
              >
                <DesignerControls section={designSection} isDarkUI={isDarkUI} text={text} textMuted={textMuted} border={border} inputBg={inputBg} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function DesignerControls({ section, isDarkUI, text, textMuted, border, inputBg }: {
  section: string
  isDarkUI: boolean
  text: string
  textMuted: string
  border: string
  inputBg: string
}) {
  const labelStyle = { fontSize: '12px', color: textMuted, marginBottom: '4px', display: 'block' as const }
  const inputStyle = {
    width: '100%',
    padding: '6px 8px',
    backgroundColor: inputBg,
    border: `1px solid ${border}`,
    borderRadius: '4px',
    color: text,
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const renderColorInput = (label: string, defaultVal: string) => (
    <div style={{ marginBottom: '12px' }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input type="color" defaultValue={defaultVal} style={{ width: '32px', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer' }} />
        <input type="text" defaultValue={defaultVal} style={{ ...inputStyle, flex: 1 }} />
      </div>
    </div>
  )

  const renderSizeInput = (label: string, defaultVal: string) => (
    <div style={{ marginBottom: '12px' }}>
      <label style={labelStyle}>{label}</label>
      <input type="text" defaultValue={defaultVal} style={inputStyle} />
    </div>
  )

  switch (section) {
    case 'global':
      return (
        <>
          {renderColorInput('背景颜色', '#ffffff')}
          {renderColorInput('文字颜色', '#333333')}
          {renderSizeInput('字体大小', '15px')}
          {renderSizeInput('行高', '1.75')}
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>字体</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }}>
              <option>-apple-system, sans-serif</option>
              <option>Georgia, serif</option>
              <option>"SF Mono", monospace</option>
            </select>
          </div>
        </>
      )
    case 'heading':
      return (
        <>
          {renderColorInput('标题颜色', '#1a1a1a')}
          {renderSizeInput('H1 大小', '24px')}
          {renderSizeInput('H2 大小', '20px')}
          {renderSizeInput('H3 大小', '16px')}
          {renderSizeInput('标题间距', '16px')}
        </>
      )
    case 'paragraph':
      return (
        <>
          {renderColorInput('文字颜色', '#333333')}
          {renderSizeInput('字号', '15px')}
          {renderSizeInput('段落间距', '16px')}
          {renderSizeInput('首行缩进', '0')}
        </>
      )
    case 'quote':
      return (
        <>
          {renderColorInput('边框颜色', '#07c160')}
          {renderColorInput('背景颜色', '#f0f9eb')}
          {renderSizeInput('字号', '14px')}
          {renderSizeInput('左边距', '12px')}
        </>
      )
    case 'list':
      return (
        <>
          {renderColorInput('标记颜色', '#07c160')}
          {renderSizeInput('字号', '15px')}
          {renderSizeInput('行间距', '8px')}
          {renderSizeInput('缩进', '20px')}
        </>
      )
    case 'code':
      return (
        <>
          {renderColorInput('背景颜色', '#f6f8fa')}
          {renderColorInput('文字颜色', '#24292e')}
          {renderSizeInput('字号', '13px')}
          {renderSizeInput('圆角', '4px')}
        </>
      )
    case 'image':
      return (
        <>
          {renderSizeInput('最大宽度', '100%')}
          {renderSizeInput('圆角', '4px')}
          {renderSizeInput('阴影', 'none')}
          {renderSizeInput('间距', '16px')}
        </>
      )
    case 'table':
      return (
        <>
          {renderColorInput('表头背景', '#f6f8fa')}
          {renderColorInput('边框颜色', '#e2e8f0')}
          {renderSizeInput('字号', '14px')}
          {renderSizeInput('单元格间距', '8px')}
        </>
      )
    case 'mermaid':
      return (
        <>
          {renderSizeInput('最大宽度', '100%')}
          {renderSizeInput('间距', '16px')}
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>主题</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }}>
              <option>default</option>
              <option>dark</option>
              <option>forest</option>
              <option>neutral</option>
            </select>
          </div>
        </>
      )
    case 'other':
      return (
        <>
          {renderColorInput('链接颜色', '#576b95')}
          {renderColorInput('分割线颜色', '#e2e8f0')}
          {renderSizeInput('脚注字号', '13px')}
          {renderSizeInput('页面内边距', '20px')}
        </>
      )
    default:
      return null
  }
}
