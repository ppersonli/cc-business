'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useEditorStore } from '../../../lib/wemd/stores/editorStore';
import { useSettingsStore } from '../../../lib/wemd/stores/settingsStore';
import type { EditorView } from '@codemirror/view';
import type { AIAction } from '../../../lib/wemd/ai/prompts';

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isPro: boolean;
  onShowUpgrade: (feature: string) => void;
}

const AI_ACTIONS: { key: AIAction; label: string; icon: string; desc: string }[] = [
  { key: 'polish', label: '润色', icon: '✨', desc: '提升文采和可读性' },
  { key: 'expand', label: '扩写', icon: '📝', desc: '丰富内容细节' },
  { key: 'shorten', label: '缩写', icon: '✂️', desc: '精简冗余表达' },
  { key: 'translate', label: '翻译', icon: '🌐', desc: '中英互译' },
  { key: 'continue', label: '续写', icon: '▶️', desc: '基于上下文继续' },
];

export default function AIPanel({ isOpen, onClose, isPro, onShowUpgrade }: AIPanelProps) {
  const { content, editorView } = useEditorStore();
  const { isDarkUI } = useSettingsStore();
  const [action, setAction] = useState<AIAction | null>(null);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [remaining, setRemaining] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const bg = isDarkUI ? '#0f172a' : '#ffffff';
  const border = isDarkUI ? '#334155' : '#e2e8f0';
  const text = isDarkUI ? '#e2e8f0' : '#1e293b';
  const textMuted = isDarkUI ? '#94a3b8' : '#64748b';
  const btnBg = isDarkUI ? '#334155' : '#f1f5f9';
  const btnHover = isDarkUI ? '#475569' : '#e2e8f0';

  const getSelectedText = useCallback((): string => {
    if (!editorView) return '';
    const view = editorView as unknown as EditorView;
    const { from, to } = view.state.selection.main;
    if (from === to) return '';
    return view.state.doc.sliceString(from, to);
  }, [editorView]);

  const runAI = useCallback(async (act: AIAction) => {
    if (!isPro) {
      onShowUpgrade(`AI ${AI_ACTIONS.find(a => a.key === act)?.label || act}`);
      return;
    }

    const selected = getSelectedText();
    const inputContent = selected || content;

    if (!inputContent.trim()) {
      setError('请先选择要处理的文本，或在编辑器中输入内容');
      return;
    }

    setAction(act);
    setResult('');
    setError('');
    setIsLoading(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/wemd/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: act,
          content: inputContent,
          context: selected ? content : undefined,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Request failed' }));
        setError(data.error || `Error: ${res.status}`);
        setIsLoading(false);
        return;
      }

      const remainingHeader = res.headers.get('X-AI-Remaining');
      if (remainingHeader) setRemaining(Number(remainingHeader));

      const reader = res.body?.getReader();
      if (!reader) {
        setError('Stream not available');
        setIsLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let fullResult = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);

          if (data === '[DONE]') {
            break;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              setError(parsed.error);
              break;
            }
            if (parsed.text) {
              fullResult += parsed.text;
              setResult(fullResult);
            }
          } catch {
            // Skip
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError('Network error. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isPro, content, getSelectedText, onShowUpgrade]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  const handleReplace = useCallback(() => {
    if (!result || !editorView) return;
    const view = editorView as unknown as EditorView;
    const { from, to } = view.state.selection.main;

    if (from !== to) {
      // Replace selection
      view.dispatch({
        changes: { from, to, insert: result },
        selection: { anchor: from + result.length },
      });
    } else {
      // Insert at cursor
      view.dispatch({
        changes: { from, to: from, insert: result },
        selection: { anchor: from + result.length },
      });
    }
    setResult('');
    setAction(null);
  }, [result, editorView]);

  const handleInsert = useCallback(() => {
    if (!result || !editorView) return;
    const view = editorView as unknown as EditorView;
    const { to } = view.state.selection.main;
    const insertText = '\n\n' + result;
    view.dispatch({
      changes: { from: to, to: to, insert: insertText },
      selection: { anchor: to + insertText.length },
    });
    setResult('');
    setAction(null);
  }, [result, editorView]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '400px',
      maxWidth: '90vw',
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
          <span style={{ fontSize: '16px' }}>✨</span>
          <span style={{ fontWeight: 700, fontSize: '15px', color: text }}>AI 写作助手</span>
          {isPro && remaining !== null && (
            <span style={{ fontSize: '11px', color: textMuted, backgroundColor: btnBg, padding: '2px 6px', borderRadius: '4px' }}>
              {remaining} 次剩余
            </span>
          )}
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

      {/* Action buttons */}
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${border}` }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {AI_ACTIONS.map((a) => (
            <button
              key={a.key}
              onClick={() => runAI(a.key)}
              disabled={isLoading}
              title={a.desc}
              style={{
                padding: '6px 12px',
                backgroundColor: action === a.key ? (isDarkUI ? '#1e3a5f' : '#dbeafe') : btnBg,
                border: `1px solid ${action === a.key ? (isDarkUI ? '#3b82f6' : '#3b82f6') : border}`,
                borderRadius: '6px',
                color: action === a.key ? (isDarkUI ? '#60a5fa' : '#2563eb') : text,
                fontSize: '13px',
                fontWeight: 500,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = btnHover; }}
              onMouseLeave={(e) => { if (action !== a.key) e.currentTarget.style.backgroundColor = btnBg; }}
            >
              <span>{a.icon}</span>
              {a.label}
              {!isPro && <span style={{ fontSize: '8px', color: '#f59e0b', verticalAlign: 'super' }}>PRO</span>}
            </button>
          ))}
        </div>
        {!getSelectedText() && (
          <p style={{ fontSize: '11px', color: textMuted, marginTop: '8px' }}>
            💡 选中编辑器中的文字可精确处理，不选则处理全文
          </p>
        )}
      </div>

      {/* Result area */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: isDarkUI ? '#450a0a' : '#fef2f2',
            border: `1px solid ${isDarkUI ? '#dc2626' : '#fecaca'}`,
            borderRadius: '8px',
            color: isDarkUI ? '#fca5a5' : '#dc2626',
            fontSize: '13px',
            marginBottom: '12px',
          }}>
            {error}
          </div>
        )}

        {result && (
          <div>
            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              color: textMuted,
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span>AI 生成结果</span>
              <span style={{ fontWeight: 400 }}>{result.length} 字</span>
            </div>
            <div style={{
              padding: '12px',
              backgroundColor: isDarkUI ? '#1e293b' : '#f8fafc',
              border: `1px solid ${border}`,
              borderRadius: '8px',
              fontSize: '13px',
              lineHeight: '1.7',
              color: text,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: '400px',
              overflow: 'auto',
            }}>
              {result}
            </div>
          </div>
        )}

        {!result && !error && !isLoading && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: textMuted }}>
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>✨</span>
            <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>选择上方的 AI 操作开始</p>
            <p style={{ fontSize: '12px' }}>
              {isPro
                ? '润色、扩写、缩写、翻译、续写 — 每天 50 次'
                : '免费用户每天 3 次 AI 调用 · 升级 Pro 享 50 次/天'
              }
            </p>
          </div>
        )}
      </div>

      {/* Footer actions */}
      {(result || isLoading) && (
        <div style={{
          padding: '12px 16px',
          borderTop: `1px solid ${border}`,
          display: 'flex',
          gap: '8px',
        }}>
          {isLoading ? (
            <button
              onClick={handleStop}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: isDarkUI ? '#dc2626' : '#ef4444',
                border: 'none',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ⏹ 停止生成
            </button>
          ) : (
            <>
              <button
                onClick={handleReplace}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: '#07c160',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                替换原文
              </button>
              <button
                onClick={handleInsert}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: btnBg,
                  border: `1px solid ${border}`,
                  borderRadius: '6px',
                  color: text,
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                插入到光标后
              </button>
              <button
                onClick={() => { setResult(''); setAction(null); }}
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'transparent',
                  border: `1px solid ${border}`,
                  borderRadius: '6px',
                  color: textMuted,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                丢弃
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
