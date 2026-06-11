'use client';

import { useSettingsStore } from '../../../lib/wemd/stores/settingsStore';

interface AIToolbarProps {
  isPro: boolean;
  onTogglePanel: () => void;
  isPanelOpen: boolean;
}

export default function AIToolbar({ isPro, onTogglePanel, isPanelOpen }: AIToolbarProps) {
  const { isDarkUI } = useSettingsStore();
  const border = isDarkUI ? '#334155' : '#e2e8f0';
  const btnBg = isDarkUI ? '#334155' : '#ffffff';
  const btnHover = isDarkUI ? '#475569' : '#f1f5f9';
  const text = isDarkUI ? '#e2e8f0' : '#1e293b';

  return (
    <button
      onClick={onTogglePanel}
      title="AI 写作助手 (Pro)"
      style={{
        padding: '4px 10px',
        backgroundColor: isPanelOpen
          ? (isDarkUI ? '#1e3a5f' : '#dbeafe')
          : btnBg,
        border: `1px solid ${isPanelOpen ? '#3b82f6' : border}`,
        borderRadius: '4px',
        color: isPanelOpen ? (isDarkUI ? '#60a5fa' : '#2563eb') : text,
        fontSize: '12px',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        flexShrink: 0,
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!isPanelOpen) e.currentTarget.style.backgroundColor = btnHover;
      }}
      onMouseLeave={(e) => {
        if (!isPanelOpen) e.currentTarget.style.backgroundColor = btnBg;
      }}
    >
      <span>✨</span>
      AI
      {!isPro && (
        <span style={{
          fontSize: '8px',
          color: '#f59e0b',
          verticalAlign: 'super',
          fontWeight: 700,
        }}>PRO</span>
      )}
    </button>
  );
}
