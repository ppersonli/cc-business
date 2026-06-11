'use client';

import { useEffect, useRef } from 'react';
import { useSettingsStore } from '../../../lib/wemd/stores/settingsStore';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
const mod = isMac ? '⌘' : 'Ctrl';
const alt = isMac ? '⌥' : 'Alt';

const SHORTCUT_GROUPS = [
  {
    title: '格式',
    shortcuts: [
      { keys: [`${mod}`, 'B'], desc: '加粗 **text**' },
      { keys: [`${mod}`, 'I'], desc: '斜体 *text*' },
      { keys: [`${mod}`, 'K'], desc: '链接 [text](url)' },
      { keys: [`${mod}`, 'Shift', 'X'], desc: '删除线 ~~text~~' },
      { keys: [`${mod}`, 'Shift', 'H'], desc: '高亮 ==text==' },
      { keys: [`${mod}`, 'Shift', 'U'], desc: '下划线 <u>text</u>' },
    ],
  },
  {
    title: '编辑',
    shortcuts: [
      { keys: [`${mod}`, 'Z'], desc: '撤销' },
      { keys: [`${mod}`, 'Shift', 'Z'], desc: '重做' },
      { keys: [`${mod}`, 'F'], desc: '搜索替换' },
      { keys: [`${mod}`, 'A'], desc: '全选' },
      { keys: [`${mod}`, 'D'], desc: '选中下一个相同词' },
      { keys: ['Tab'], desc: '缩进' },
      { keys: ['Shift', 'Tab'], desc: '反缩进' },
    ],
  },
  {
    title: '导航',
    shortcuts: [
      { keys: [`${mod}`, 'Home'], desc: '跳到文档顶部' },
      { keys: [`${mod}`, 'End'], desc: '跳到文档底部' },
      { keys: [`${alt}`, '↑'], desc: '上移一行' },
      { keys: [`${alt}`, '↓'], desc: '下移一行' },
    ],
  },
];

export default function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  const { isDarkUI } = useSettingsStore();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const bg = isDarkUI ? '#1e293b' : '#ffffff';
  const border = isDarkUI ? '#334155' : '#e2e8f0';
  const text = isDarkUI ? '#e2e8f0' : '#1e293b';
  const textMuted = isDarkUI ? '#94a3b8' : '#64748b';
  const keyBg = isDarkUI ? '#334155' : '#f1f5f9';
  const sectionBg = isDarkUI ? '#0f172a' : '#f8fafc';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={modalRef}
        style={{
          position: 'relative',
          width: '520px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          overflowY: 'auto',
          backgroundColor: bg,
          border: `1px solid ${border}`,
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: text }}>
            ⌨️ 键盘快捷键
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: textMuted,
              fontSize: '18px',
              padding: '4px',
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '16px 20px' }}>
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title} style={{ marginBottom: '20px' }}>
              <h3 style={{
                fontSize: '13px',
                fontWeight: 600,
                color: textMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px',
              }}>
                {group.title}
              </h3>
              <div style={{
                backgroundColor: sectionBg,
                border: `1px solid ${border}`,
                borderRadius: '8px',
                overflow: 'hidden',
              }}>
                {group.shortcuts.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      borderBottom: i < group.shortcuts.length - 1 ? `1px solid ${border}` : 'none',
                    }}
                  >
                    <span style={{ fontSize: '13px', color: text }}>{s.desc}</span>
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      {s.keys.map((key, j) => (
                        <span key={j}>
                          <kbd style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            backgroundColor: keyBg,
                            border: `1px solid ${border}`,
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontFamily: "'SF Mono', monospace",
                            color: text,
                            boxShadow: `0 1px 0 ${border}`,
                          }}>
                            {key}
                          </kbd>
                          {j < s.keys.length - 1 && (
                            <span style={{ color: textMuted, fontSize: '12px', margin: '0 2px' }}>+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: `1px solid ${border}`,
          textAlign: 'center',
          fontSize: '12px',
          color: textMuted,
        }}>
          按 <kbd style={{
            padding: '1px 6px',
            backgroundColor: keyBg,
            border: `1px solid ${border}`,
            borderRadius: '3px',
            fontSize: '11px',
            fontFamily: 'monospace',
          }}>Esc</kbd> 关闭
        </div>
      </div>
    </div>
  );
}
