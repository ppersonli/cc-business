// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

'use client'

import { useState } from 'react'
import { useThemeStore, exportThemeCSS, exportThemeJSON, importThemeJSON } from '../../../lib/wemd/stores/themeStore'
import { useSettingsStore } from '../../../lib/wemd/stores/settingsStore'
import { builtInThemes, isProTheme } from '../../../lib/wemd/themes'
import type { Theme } from '../../../lib/wemd/types'
import ThemeDesigner from './ThemeDesigner'
import CustomCSSEditor from './CustomCSSEditor'

interface ThemePanelProps {
  isOpen: boolean
  onClose: () => void
  isPro?: boolean
  onShowUpgrade?: (feature: string) => void
}

const SAMPLE_HTML = `<h3 style="margin:0 0 8px">Heading</h3><p style="margin:0 0 6px">Body text with <strong>bold</strong> and <em>italic</em>.</p><pre class="hljs" style="margin:0;padding:6px;border-radius:4px;font-size:11px"><code>code()</code></pre>`

type TabKey = 'themes' | 'css' | 'designer'

export default function ThemePanel({ isOpen, onClose, isPro = false, onShowUpgrade }: ThemePanelProps) {
  const { currentThemeId, setCurrentThemeId, customThemes } = useThemeStore()
  const { isDarkUI } = useSettingsStore()
  const [activeTab, setActiveTab] = useState<TabKey>('themes')

  if (!isOpen) return null

  const bg = isDarkUI ? '#0f172a' : '#ffffff'
  const surfaceBg = isDarkUI ? '#1e293b' : '#f8fafc'
  const border = isDarkUI ? '#334155' : '#e2e8f0'
  const text = isDarkUI ? '#e2e8f0' : '#1e293b'
  const textMuted = isDarkUI ? '#94a3b8' : '#64748b'
  const activeBg = isDarkUI ? '#1e3a5f' : '#e0f2fe'
  const activeBorder = isDarkUI ? '#3b82f6' : '#0284c7'

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'themes', label: '主题选择' },
    { key: 'css', label: '自定义 CSS' },
    { key: 'designer', label: '可视化设计' },
  ]

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
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              onClick={() => exportThemeCSS()}
              title="导出当前主题 CSS"
              style={{
                padding: '4px 8px',
                backgroundColor: 'transparent',
                border: `1px solid ${border}`,
                borderRadius: '4px',
                color: textMuted,
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              导出 CSS
            </button>
            <button
              onClick={() => exportThemeJSON()}
              title="导出当前主题 JSON"
              style={{
                padding: '4px 8px',
                backgroundColor: 'transparent',
                border: `1px solid ${border}`,
                borderRadius: '4px',
                color: textMuted,
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              导出 JSON
            </button>
            <button
              onClick={async () => {
                const theme = await importThemeJSON()
                if (theme) setCurrentThemeId(theme.id)
              }}
              title="导入主题 JSON 文件"
              style={{
                padding: '4px 8px',
                backgroundColor: 'transparent',
                border: `1px solid ${border}`,
                borderRadius: '4px',
                color: textMuted,
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              导入
            </button>
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
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: `1px solid ${border}`,
          }}
        >
          {tabs.map((tab) => {
            const isProTab = (tab.key === 'css' || tab.key === 'designer') && !isPro
            return (
              <button
                key={tab.key}
                onClick={() => {
                  if (isProTab && onShowUpgrade) {
                    onShowUpgrade(tab.key === 'css' ? 'Custom CSS' : 'Visual Theme Designer')
                  } else {
                    setActiveTab(tab.key)
                  }
                }}
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                {tab.label}
                {isProTab && <span style={{ fontSize: '9px', color: '#f59e0b', fontWeight: 700 }}>PRO</span>}
              </button>
            )
          })}
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
                      if (isProTheme(theme.id) && !isPro) {
                        onShowUpgrade?.(`Theme: ${theme.name}`)
                        return
                      }
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
                      cursor: isProTheme(theme.id) && !isPro ? 'not-allowed' : 'pointer',
                      textAlign: 'left' as const,
                      transition: 'all 0.15s',
                      opacity: isProTheme(theme.id) && !isPro ? 0.7 : 1,
                      position: 'relative' as const,
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
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {theme.name}
                      {isProTheme(theme.id) && !isPro && (
                        <span style={{
                          fontSize: '9px',
                          fontWeight: 700,
                          color: '#f59e0b',
                          backgroundColor: isDarkUI ? '#422006' : '#fffbeb',
                          border: '1px solid #f59e0b',
                          padding: '1px 5px',
                          borderRadius: '4px',
                        }}>PRO</span>
                      )}
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

          {activeTab === 'css' && isPro && (
            <CustomCSSEditor />
          )}

          {activeTab === 'css' && !isPro && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>💅</span>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: text, marginBottom: '8px' }}>自定义 CSS 编辑器</h3>
              <p style={{ fontSize: '13px', color: textMuted, marginBottom: '16px', lineHeight: '1.6' }}>
                使用 CSS 代码精细控制每个元素的样式，包括字体、颜色、间距、边框等所有细节。
              </p>
              <button
                onClick={() => onShowUpgrade?.('Custom CSS Editor')}
                style={{
                  padding: '8px 24px',
                  backgroundColor: '#f59e0b',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                升级 Pro 解锁
              </button>
            </div>
          )}

          {activeTab === 'designer' && isPro && (
            <ThemeDesigner onClose={onClose} />
          )}

          {activeTab === 'designer' && !isPro && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>🎨</span>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: text, marginBottom: '8px' }}>可视化主题设计器</h3>
              <p style={{ fontSize: '13px', color: textMuted, marginBottom: '16px', lineHeight: '1.6' }}>
                通过滑块和颜色选择器可视化调整 10 个分类的样式参数，实时预览效果，无需编写代码。
              </p>
              <button
                onClick={() => onShowUpgrade?.('Visual Theme Designer')}
                style={{
                  padding: '8px 24px',
                  backgroundColor: '#f59e0b',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                升级 Pro 解锁
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

