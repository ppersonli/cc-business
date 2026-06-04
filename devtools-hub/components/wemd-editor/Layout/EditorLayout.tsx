// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useEditorStore } from '../../../lib/wemd/stores/editorStore'
import { useThemeStore } from '../../../lib/wemd/stores/themeStore'
import { useSettingsStore } from '../../../lib/wemd/stores/settingsStore'
import { useHistoryStore } from '../../../lib/wemd/stores/historyStore'
import { useAutoSave } from '../../../lib/wemd/hooks/useAutoSave'
import { useSyncScroll } from '../../../lib/wemd/hooks/useSyncScroll'
import { copyToWechat, exportAsHtml } from '../../../lib/wemd/copy/wechatCopy'
import { builtInThemes } from '../../../lib/wemd/themes'
import type { Theme } from '../../../lib/wemd/types'
import CodeMirrorEditor from '../Editor/CodeMirrorEditor'
import Toolbar from '../Editor/Toolbar'
import StatusBar from '../Editor/StatusBar'
import HistoryPane from '../Sidebar/HistoryPane'
import MarkdownPreview from '../Preview/MarkdownPreview'
import ThemePanel from '../Theme/ThemePanel'

function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const check = () => setMobile(window.innerWidth <= breakpoint)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [breakpoint])
  return mobile
}

export default function EditorLayout() {
  const { content, setSaveStatus, setLastSaved } = useEditorStore()
  const { currentThemeId } = useThemeStore()
  const { isDarkUI, toggleDarkUI, showThemePanel, setShowThemePanel } = useSettingsStore()
  const { activeId, updateArticle } = useHistoryStore()
  const [copied, setCopied] = useState(false)
  const [copiedHTML, setCopiedHTML] = useState(false)
  const [splitRatio, setSplitRatio] = useState(0.5)
  const [isDragging, setIsDragging] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [previewTab, setPreviewTab] = useState<'preview' | 'wechat'>('preview')
  const [showStorageModal, setShowStorageModal] = useState(false)
  const [showImageHostModal, setShowImageHostModal] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const editorWrapRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMobile = useIsMobile()

  // Prevent body from scrolling — editor manages its own scroll
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Auto-save to IndexedDB
  useEffect(() => {
    if (!activeId) return
    setSaveStatus('saving')

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      // Also save to localStorage as backup
      try { localStorage.setItem('wemd-content', content) } catch {}

      updateArticle(activeId, content).then(() => {
        setLastSaved(Date.now())
      })
    }, 1000)

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [content, activeId, updateArticle, setSaveStatus, setLastSaved])

  // Sync scroll
  useSyncScroll(editorWrapRef, previewRef)

  // Get current theme name
  const currentTheme = builtInThemes.find((t: Theme) => t.id === currentThemeId)

  // Copy to WeChat
  const handleCopy = useCallback(async () => {
    const success = await copyToWechat(content, currentThemeId)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [content, currentThemeId])

  // Copy raw HTML
  const handleCopyHTML = useCallback(async () => {
    const html = exportAsHtml(content, currentThemeId)
    try {
      await navigator.clipboard.writeText(html)
      setCopiedHTML(true)
      setTimeout(() => setCopiedHTML(false), 2000)
    } catch {
      // clipboard unavailable
    }
  }, [content, currentThemeId])

  // Drag to resize
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const ratio = (e.clientX - rect.left) / rect.width
      setSplitRatio(Math.min(0.8, Math.max(0.2, ratio)))
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging])

  // Colors
  const bg = isDarkUI ? '#0f172a' : '#ffffff'
  const headerBg = isDarkUI ? '#1e293b' : '#f1f5f9'
  const border = isDarkUI ? '#334155' : '#e2e8f0'
  const text = isDarkUI ? '#e2e8f0' : '#1e293b'
  const textMuted = isDarkUI ? '#94a3b8' : '#64748b'
  const accentBg = isDarkUI ? '#065f46' : '#07C160'
  const accentHover = isDarkUI ? '#059669' : '#05a850'
  const btnBg = isDarkUI ? '#334155' : '#ffffff'
  const btnHover = isDarkUI ? '#475569' : '#e2e8f0'

  const headerBtnStyle = {
    padding: isMobile ? '4px 6px' : '5px 12px',
    backgroundColor: btnBg,
    border: `1px solid ${border}`,
    borderRadius: '6px',
    color: text,
    fontSize: isMobile ? '12px' : '13px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'background-color 0.15s',
    whiteSpace: 'nowrap' as const,
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 64px)',
        backgroundColor: bg,
        color: text,
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '4px 8px' : '6px 12px',
          backgroundColor: headerBg,
          borderBottom: `1px solid ${border}`,
          gap: '8px',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {/* Left: Logo + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#07c160" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {!isMobile && (
            <span style={{ fontSize: '15px', fontWeight: 700, color: text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              WeMD 公众号 Markdown 排版编辑器
            </span>
          )}
        </div>

        {/* Right: Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {/* 存储模式 */}
          <button
            onClick={() => setShowStorageModal(!showStorageModal)}
            style={headerBtnStyle}
            title="存储模式"
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = btnHover }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = btnBg }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            {!isMobile && '存储模式'}
          </button>

          {/* 图床设置 */}
          <button
            onClick={() => setShowImageHostModal(!showImageHostModal)}
            style={headerBtnStyle}
            title="图床设置"
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = btnHover }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = btnBg }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            {!isMobile && '图床设置'}
          </button>

          {/* 主题管理 */}
          <button
            onClick={() => setShowThemePanel(true)}
            style={headerBtnStyle}
            title="主题管理"
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = btnHover }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = btnBg }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="13.5" cy="6.5" r="2.5" />
              <circle cx="6" cy="12" r="2.5" />
              <circle cx="18" cy="12" r="2.5" />
            </svg>
            {!isMobile && '主题管理'}
          </button>

          {/* 复制 HTML */}
          <button
            onClick={handleCopyHTML}
            style={headerBtnStyle}
            title="复制 HTML"
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = btnHover }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = btnBg }}
          >
            {copiedHTML ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#07c160" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {!isMobile && '已复制'}
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
                {!isMobile && '复制 HTML'}
              </>
            )}
          </button>

          {/* 复制到公众号 (Primary) */}
          <button
            onClick={handleCopy}
            style={{
              padding: isMobile ? '5px 10px' : '5px 14px',
              backgroundColor: copied ? '#16a34a' : accentBg,
              border: 'none',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'background-color 0.15s',
              whiteSpace: 'nowrap',
            }}
            title="复制到公众号"
            onMouseEnter={(e) => {
              if (!copied) e.currentTarget.style.backgroundColor = accentHover
            }}
            onMouseLeave={(e) => {
              if (!copied) e.currentTarget.style.backgroundColor = accentBg
            }}
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {!isMobile && '已复制!'}
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                {!isMobile && '复制到公众号'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sub-header: Hide sidebar toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '4px 12px',
          backgroundColor: headerBg,
          borderBottom: `1px solid ${border}`,
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          style={{
            padding: '3px 10px',
            backgroundColor: 'transparent',
            border: `1px solid ${border}`,
            borderRadius: '4px',
            color: textMuted,
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {showSidebar ? (
              <>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </>
            ) : (
              <>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="3" x2="3" y2="21" />
              </>
            )}
          </svg>
          {showSidebar ? '隐藏列表' : '显示列表'}
        </button>
      </div>

      {/* Main content: 3-column (desktop) / column (mobile) */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          overflow: 'hidden',
        }}
      >
        {/* Left Sidebar - History (hidden on mobile) */}
        {showSidebar && !isMobile && (
          <div style={{ width: '250px', flexShrink: 0, overflow: 'hidden', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <HistoryPane />
          </div>
        )}

        {/* Center - Editor */}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderLeft: showSidebar && !isMobile ? `1px solid ${border}` : 'none',
            borderRight: isMobile ? 'none' : `1px solid ${border}`,
            borderBottom: isMobile ? `1px solid ${border}` : 'none',
            minHeight: isMobile ? '40vh' : undefined,
          }}
        >
          <Toolbar />
          <div ref={editorWrapRef} style={{ flex: 1, overflow: 'hidden' }}>
            <CodeMirrorEditor />
          </div>
          <StatusBar />
        </div>

        {/* Right - Preview */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: isMobile ? '40vh' : undefined,
          }}
        >
          {/* Preview tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              backgroundColor: headerBg,
              borderBottom: `1px solid ${border}`,
              flexShrink: 0,
              gap: '0',
            }}
          >
            <button
              onClick={() => setPreviewTab('preview')}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: previewTab === 'preview' ? `2px solid ${isDarkUI ? '#3b82f6' : '#07c160'}` : '2px solid transparent',
                color: previewTab === 'preview' ? text : textMuted,
                fontSize: '13px',
                fontWeight: previewTab === 'preview' ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              实时预览
            </button>
            <button
              onClick={() => setPreviewTab('wechat')}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: previewTab === 'wechat' ? `2px solid ${isDarkUI ? '#3b82f6' : '#07c160'}` : '2px solid transparent',
                color: previewTab === 'wechat' ? text : textMuted,
                fontSize: '13px',
                fontWeight: previewTab === 'wechat' ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              微信排版效果
            </button>
          </div>

          {/* Preview content */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <MarkdownPreview
              ref={previewRef}
              content={content}
              wechatMode={previewTab === 'wechat'}
            />
          </div>
        </div>
      </div>

      {/* Theme Panel */}
      <ThemePanel isOpen={showThemePanel} onClose={() => setShowThemePanel(false)} />

      {/* Storage Mode Modal */}
      {showStorageModal && (
        <>
          <div
            onClick={() => setShowStorageModal(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 998 }}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: bg,
              border: `1px solid ${border}`,
              borderRadius: '12px',
              padding: '24px',
              zIndex: 999,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              minWidth: '320px',
              maxWidth: '90vw',
            }}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: text }}>
              存储模式
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{
                  padding: '12px',
                  border: `2px solid ${isDarkUI ? '#3b82f6' : '#07c160'}`,
                  borderRadius: '8px',
                  backgroundColor: isDarkUI ? '#1e3a5f' : '#e8f5e9',
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 600, color: text, marginBottom: '4px' }}>
                  IndexedDB 本地存储
                </div>
                <div style={{ fontSize: '12px', color: textMuted }}>
                  数据保存在浏览器本地，支持多篇文章管理
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowStorageModal(false)}
              style={{
                marginTop: '16px',
                padding: '8px 20px',
                backgroundColor: '#07c160',
                border: 'none',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                float: 'right',
              }}
            >
              确定
            </button>
          </div>
        </>
      )}

      {/* Image Host Modal */}
      {showImageHostModal && (
        <>
          <div
            onClick={() => setShowImageHostModal(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 998 }}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: bg,
              border: `1px solid ${border}`,
              borderRadius: '12px',
              padding: '24px',
              zIndex: 999,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              minWidth: '320px',
              maxWidth: '90vw',
            }}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: text }}>
              图床设置
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', color: textMuted, display: 'block', marginBottom: '4px' }}>图床类型</label>
                <select
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: isDarkUI ? '#0f172a' : '#ffffff',
                    border: `1px solid ${border}`,
                    borderRadius: '6px',
                    color: text,
                    fontSize: '13px',
                    outline: 'none',
                  }}
                >
                  <option>默认 (直接链接)</option>
                  <option>SM.MS</option>
                  <option>Imgur</option>
                  <option>自定义 API</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '13px', color: textMuted, display: 'block', marginBottom: '4px' }}>API Token</label>
                <input
                  type="text"
                  placeholder="输入图床 API Token..."
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: isDarkUI ? '#0f172a' : '#ffffff',
                    border: `1px solid ${border}`,
                    borderRadius: '6px',
                    color: text,
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                onClick={() => setShowImageHostModal(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: btnBg,
                  border: `1px solid ${border}`,
                  borderRadius: '6px',
                  color: text,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
              <button
                onClick={() => setShowImageHostModal(false)}
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
                保存
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
