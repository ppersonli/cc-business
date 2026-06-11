'use client';

import { useState } from 'react';
import { useSettingsStore } from '../../../lib/wemd/stores/settingsStore';
import { useEditorStore } from '../../../lib/wemd/stores/editorStore';
import { templates, type Template } from '../../../lib/wemd/templates';

interface TemplateLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  isPro: boolean;
  onShowUpgrade: (feature: string) => void;
}

const CATEGORIES: { key: Template['category'] | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'business', label: '商务' },
  { key: 'content', label: '内容' },
  { key: 'technical', label: '技术' },
];

export default function TemplateLibrary({ isOpen, onClose, isPro, onShowUpgrade }: TemplateLibraryProps) {
  const { isDarkUI } = useSettingsStore();
  const { setContent } = useEditorStore();
  const [category, setCategory] = useState<Template['category'] | 'all'>('all');
  const [previewId, setPreviewId] = useState<string | null>(null);

  const bg = isDarkUI ? '#0f172a' : '#ffffff';
  const border = isDarkUI ? '#334155' : '#e2e8f0';
  const text = isDarkUI ? '#e2e8f0' : '#1e293b';
  const textMuted = isDarkUI ? '#94a3b8' : '#64748b';
  const surfaceBg = isDarkUI ? '#1e293b' : '#f8fafc';
  const btnBg = isDarkUI ? '#334155' : '#f1f5f9';
  const btnHover = isDarkUI ? '#475569' : '#e2e8f0';

  const filtered = category === 'all' ? templates : templates.filter(t => t.category === category);
  const previewTemplate = previewId ? templates.find(t => t.id === previewId) : null;

  const handleApply = (tpl: Template) => {
    if (tpl.isPro && !isPro) {
      onShowUpgrade(`模板: ${tpl.name}`);
      return;
    }
    if (confirm(`应用模板「${tpl.name}」？当前编辑器内容将被替换。`)) {
      setContent(tpl.content);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '480px',
      maxWidth: '95vw',
      height: '100vh',
      backgroundColor: bg,
      borderLeft: `1px solid ${border}`,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 90,
      boxShadow: '-4px 0 16px rgba(0,0,0,0.1)',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>📄</span>
          <span style={{ fontWeight: 700, fontSize: '15px', color: text }}>模板库</span>
          <span style={{ fontSize: '11px', color: textMuted, backgroundColor: btnBg, padding: '2px 6px', borderRadius: '4px' }}>
            {templates.length} 个模板
          </span>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: textMuted, padding: '4px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </button>
      </div>

      {/* Category tabs */}
      <div style={{
        padding: '8px 16px',
        borderBottom: `1px solid ${border}`,
        display: 'flex',
        gap: '6px',
      }}>
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            style={{
              padding: '4px 12px',
              backgroundColor: category === c.key ? (isDarkUI ? '#1e3a5f' : '#dbeafe') : 'transparent',
              border: `1px solid ${category === c.key ? (isDarkUI ? '#3b82f6' : '#3b82f6') : border}`,
              borderRadius: '16px',
              color: category === c.key ? (isDarkUI ? '#60a5fa' : '#2563eb') : textMuted,
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Template list */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(tpl => (
            <div
              key={tpl.id}
              style={{
                padding: '12px',
                backgroundColor: surfaceBg,
                border: `1px solid ${border}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s',
                position: 'relative',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = isDarkUI ? '#3b82f6' : '#07c160'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = border; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{tpl.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: '14px', color: text }}>{tpl.name}</span>
                  {tpl.isPro && (
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
                </div>
              </div>
              <p style={{ fontSize: '12px', color: textMuted, margin: '0 0 8px' }}>{tpl.description}</p>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => handleApply(tpl)}
                  style={{
                    padding: '4px 12px',
                    backgroundColor: '#07c160',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  应用模板
                </button>
                <button
                  onClick={() => setPreviewId(previewId === tpl.id ? null : tpl.id)}
                  style={{
                    padding: '4px 12px',
                    backgroundColor: btnBg,
                    border: `1px solid ${border}`,
                    borderRadius: '4px',
                    color: text,
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = btnHover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = btnBg; }}
                >
                  {previewId === tpl.id ? '收起预览' : '预览'}
                </button>
              </div>

              {/* Preview */}
              {previewId === tpl.id && (
                <div style={{
                  marginTop: '10px',
                  padding: '10px',
                  backgroundColor: bg,
                  border: `1px solid ${border}`,
                  borderRadius: '6px',
                  maxHeight: '200px',
                  overflow: 'auto',
                  fontSize: '12px',
                  lineHeight: '1.6',
                  color: text,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: 'monospace',
                }}>
                  {tpl.content.slice(0, 800)}
                  {tpl.content.length > 800 && '\n\n... (更多内容)'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
