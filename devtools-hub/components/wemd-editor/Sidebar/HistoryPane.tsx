// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useHistoryStore } from '../../../lib/wemd/stores/historyStore'
import { useEditorStore } from '../../../lib/wemd/stores/editorStore'
import { useSettingsStore } from '../../../lib/wemd/stores/settingsStore'

function formatTime(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export default function HistoryPane() {
  const { articles, activeId, isLoading, loadArticles, createArticle, deleteArticle, setActiveArticle, clearAll } = useHistoryStore()
  const { content } = useEditorStore()
  const { isDarkUI } = useSettingsStore()
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadArticles()
  }, [loadArticles])

  const filtered = search
    ? articles.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()))
    : articles

  const bg = isDarkUI ? '#0f172a' : '#ffffff'
  const surfaceBg = isDarkUI ? '#1e293b' : '#f8fafc'
  const border = isDarkUI ? '#334155' : '#e2e8f0'
  const text = isDarkUI ? '#e2e8f0' : '#1e293b'
  const textMuted = isDarkUI ? '#94a3b8' : '#64748b'
  const activeBg = isDarkUI ? '#1e3a5f' : '#e8f5e9'
  const activeBorder = isDarkUI ? '#3b82f6' : '#07c160'
  const hoverBg = isDarkUI ? '#1e293b' : '#f1f5f9'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: bg,
        borderRight: `1px solid ${border}`,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px',
          borderBottom: `1px solid ${border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: 600, color: text }}>
          历史记录
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => createArticle(content)}
            title="新增文章"
            style={{
              padding: '4px 8px',
              backgroundColor: 'transparent',
              border: `1px solid ${border}`,
              borderRadius: '4px',
              color: textMuted,
              fontSize: '14px',
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            +
          </button>
          <button
            onClick={() => {
              if (confirm('确定清空所有历史记录？')) clearAll()
            }}
            title="清空历史"
            style={{
              padding: '4px 8px',
              backgroundColor: 'transparent',
              border: `1px solid ${border}`,
              borderRadius: '4px',
              color: textMuted,
              fontSize: '14px',
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '8px 12px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 8px',
            backgroundColor: surfaceBg,
            border: `1px solid ${border}`,
            borderRadius: '4px',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="搜索文章..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              backgroundColor: 'transparent',
              color: text,
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Article List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 8px 8px',
        }}
      >
        {isLoading ? (
          <div style={{ padding: '16px', textAlign: 'center', color: textMuted, fontSize: '13px' }}>
            加载中...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: textMuted, fontSize: '13px' }}>
            {search ? '没有匹配的文章' : '暂无文章'}
          </div>
        ) : (
          filtered.map((article) => {
            const isActive = article.id === activeId
            return (
              <div
                key={article.id}
                onClick={() => setActiveArticle(article.id)}
                style={{
                  padding: '10px 12px',
                  marginBottom: '4px',
                  backgroundColor: isActive ? activeBg : 'transparent',
                  border: isActive ? `1px solid ${activeBorder}` : '1px solid transparent',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  position: 'relative' as const,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = hoverBg
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 400,
                    color: text,
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    paddingRight: '24px',
                  }}
                >
                  {article.title}
                </div>
                <div style={{ fontSize: '11px', color: textMuted }}>
                  {formatTime(article.updatedAt)}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (articles.length > 1) deleteArticle(article.id)
                  }}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    padding: '2px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: textMuted,
                    cursor: 'pointer',
                    fontSize: '12px',
                    lineHeight: 1,
                    opacity: 0.5,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5' }}
                  title="删除"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
