// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

'use client'

import { useState, useEffect } from 'react'
import { useEditorStore } from '../../../lib/wemd/stores/editorStore'
import { useSettingsStore } from '../../../lib/wemd/stores/settingsStore'

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000)
  if (seconds < 5) return '刚刚保存'
  if (seconds < 60) return `${seconds}秒前保存`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}分钟前保存`
  const hours = Math.floor(minutes / 60)
  return `${hours}小时前保存`
}

export default function StatusBar() {
  const { lineCount, wordCount, saveStatus, lastSaved } = useEditorStore()
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
      <div style={{ flex: 1 }} />
      <span style={{ fontSize: '11px', color: isDarkUI ? '#475569' : '#94a3b8' }}>
        Ctrl+B 加粗 · Ctrl+I 斜体 · Ctrl+F 搜索
      </span>
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
