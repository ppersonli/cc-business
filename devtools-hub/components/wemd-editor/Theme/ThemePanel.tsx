// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

'use client'

import { useState } from 'react'
import { useThemeStore } from '../../../lib/wemd/stores/themeStore'
import { useSettingsStore } from '../../../lib/wemd/stores/settingsStore'
import { builtInThemes } from '../../../lib/wemd/themes'
import type { Theme } from '../../../lib/wemd/types'
import ThemeDesigner from './ThemeDesigner'
import CustomCSSEditor from './CustomCSSEditor'

interface ThemePanelProps {
  isOpen: boolean
  onClose: () => void
}

const SAMPLE_HTML = `<h3 style="margin:0 0 8px">Heading</h3><p style="margin:0 0 6px">Body text with <strong>bold</strong> and <em>italic</em>.</p><pre class="hljs" style="margin:0;padding:6px;border-radius:4px;font-size:11px"><code>code()</code></pre>`

type TabKey = 'themes' | 'css' | 'designer'

export default function ThemePanel({ isOpen, onClose }: ThemePanelProps) {
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
            <CustomCSSEditor />
          )}

          {activeTab === 'designer' && (
            <ThemeDesigner onClose={onClose} />
          )}
        </div>
      </div>
    </>
  )
}

