'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSettingsStore } from '../../../lib/wemd/stores/settingsStore';

const DISMISS_KEY = 'wemd-paywall-dismissed';
const DISMISS_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface ProPaywallProps {
  isPro: boolean;
  onShowUpgrade: (feature: string) => void;
  proAttemptCount?: number;
}

export default function ProPaywall({ isPro, onShowUpgrade, proAttemptCount = 0 }: ProPaywallProps) {
  const { isDarkUI } = useSettingsStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isPro) return;

    // Check if dismissed recently
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - Number(dismissedAt);
      if (elapsed < DISMISS_DURATION) return;
    }

    // Show after a delay
    const timer = setTimeout(() => setIsVisible(true), 3000);
    return () => clearTimeout(timer);
  }, [isPro]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  }, []);

  if (isPro || !isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 80,
        maxWidth: '560px',
        width: 'calc(100% - 32px)',
        backgroundColor: isDarkUI ? '#1e293b' : '#ffffff',
        border: `1px solid ${isDarkUI ? '#334155' : '#e2e8f0'}`,
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        animation: 'paywallSlideUp 0.3s ease-out',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '13px',
          fontWeight: 600,
          color: isDarkUI ? '#e2e8f0' : '#1e293b',
          marginBottom: '2px',
        }}>
          🚀 解锁 WeMD Pro 全部功能
        </div>
        <div style={{
          fontSize: '12px',
          color: isDarkUI ? '#94a3b8' : '#64748b',
        }}>
          AI 写作助手 · 文章分析 · 8 个高级模板 · PDF 导出 · 8 个高级主题 · 自定义 CSS
          {proAttemptCount > 0 && (
            <span style={{ color: '#f59e0b', marginLeft: '4px' }}>
              · 已尝试 {proAttemptCount} 次 Pro 功能
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onShowUpgrade('Pro Features')}
        style={{
          padding: '6px 16px',
          backgroundColor: '#f59e0b',
          border: 'none',
          borderRadius: '6px',
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        升级 Pro
      </button>

      <button
        onClick={handleDismiss}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: isDarkUI ? '#64748b' : '#94a3b8',
          padding: '4px',
          flexShrink: 0,
          fontSize: '16px',
          lineHeight: 1,
        }}
        title="关闭 (24小时内不再显示)"
      >
        ×
      </button>

      <style jsx>{`
        @keyframes paywallSlideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
