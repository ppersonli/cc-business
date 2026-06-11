// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

'use client'

import { useState, useEffect } from 'react'
import { useEditorStore } from '../../../lib/wemd/stores/editorStore'
import { useSettingsStore } from '../../../lib/wemd/stores/settingsStore'

interface StatusBarProps {
  onShowShortcuts?: () => void
  onShareLink?: () => void
}

/** WeChat article character limit */
const WECHAT_CHAR_LIMIT = 20000;

function WechatLimitIndicator({ charCount, isDarkUI }: { charCount: number; isDarkUI: boolean }) {
  const pct = Math.min(charCount / WECHAT_CHAR_LIMIT, 1);
  const isWarning = pct > 0.8;
  const isOver = pct >= 1;
  const barColor = isOver ? '#ef4444' : isWarning ? '#f59e0b' : '#07c160';
  const text = isDarkUI ? '#94a3b8' : '#64748b';

  if (charCount < 1000) return null; // Don't show for short articles

  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title={`微信文章字数限制约 ${WECHAT_CHAR_LIMIT.toLocaleString()} 字`}>
      <span style={{
        display: 'inline-block',
        width: '40px',
        height: '4px',
        backgroundColor: isDarkUI ? '#334155' : '#e2e8f0',
        borderRadius: '2px',
        overflow: 'hidden',
      }}>
        <span style={{
          display: 'block',
          height: '100%',
          width: `${pct * 100}%`,
          backgroundColor: barColor,
          borderRadius: '2px',
          transition: 'width 0.3s',
        }} />
      </span>
      <span style={{ fontSize: '11px', color: isOver || isWarning ? barColor : text }}>
        {isOver ? `超 ${(charCount - WECHAT_CHAR_LIMIT).toLocaleString()} 字` : `${Math.round(pct * 100)}%`}
      </span>
    </span>
  );
}

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000)
  if (seconds < 5) return '刚刚保存'
  if (seconds < 60) return `${seconds}秒前保存`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}分钟前保存`
  const hours = Math.floor(minutes / 60)
  return `${hours}小时前保存`
}

export default function StatusBar({ onShowShortcuts, onShareLink }: StatusBarProps) {
  const { lineCount, wordCount, content, saveStatus, lastSaved } = useEditorStore()
  const { isDarkUI } = useSettingsStore()
  const [, setTick] = useState(0)

  // Update relative time every 10 seconds
  useEffect(() => {
    if (!lastSaved) return
    const timer = setInterval(() => setTick((t) => t + 1), 10000)
    return () => clearInterval(timer)
  }, [lastSaved])

  const bg = isDarkUI ? '#1e293b' : '#f8fafc'
  const border = isDarkUI ? '#334155' : '#e2e8f0'
  const text = isDarkUI ? '#94a3b8' : '#64748b'

  const saveColor = saveStatus === 'saved' ? '#07c160' : saveStatus === 'saving' ? '#e6a23c' : text
  const saveIcon = saveStatus === 'saved' ? '✓' : saveStatus === 'saving' ? '●' : '○'

  const saveText = saveStatus === 'saving'
    ? '保存中...'
    : saveStatus === 'saved' && lastSaved
      ? timeAgo(lastSaved)
      : '未保存'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '4px 16px',
        backgroundColor: bg,
        borderTop: `1px solid ${border}`,
        fontSize: '12px',
        color: text,
        flexShrink: 0,
      }}
    >
      <span>行数: {lineCount}</span>
      <span>字数: {wordCount}</span>
      <WechatLimitIndicator charCount={content.length} isDarkUI={isDarkUI} />
      <div style={{ flex: 1 }} />
      {onShareLink && (
        <button
          onClick={onShareLink}
          title="生成分享链接"
          style={{
            padding: '2px 6px',
            backgroundColor: 'transparent',
            border: `1px solid ${border}`,
            borderRadius: '3px',
            color: text,
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          🔗 分享
        </button>
      )}
      {onShowShortcuts && (
        <button
          onClick={onShowShortcuts}
          title="键盘快捷键"
          style={{
            padding: '2px 6px',
            backgroundColor: 'transparent',
            border: `1px solid ${border}`,
            borderRadius: '3px',
            color: text,
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          ⌨ 快捷键
        </button>
      )}
      <span
        style={{
          color: saveColor,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <span style={{ fontSize: '10px' }}>{saveIcon}</span>
        {saveText}
      </span>
    </div>
  )
}
