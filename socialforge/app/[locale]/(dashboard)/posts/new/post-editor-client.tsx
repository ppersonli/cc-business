'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import PostEditor from '@/components/editor/post-editor';
import PlatformSelector from '@/components/editor/platform-selector';
import { validatePostContent, stripHtml } from '@/lib/content/platform';
import { Save, Send, Clock, CheckCircle } from 'lucide-react';

interface Props {
  mode: 'create' | 'edit';
  initialData?: {
    id: string;
    content: string;
    targetPlatforms: string[];
    status: string;
    scheduledAt: string | null;
  };
}

export default function PostEditorClient({ mode, initialData }: Props) {
  const router = useRouter();
  const [content, setContent] = useState(initialData?.content || '');
  const [platforms, setPlatforms] = useState<string[]>(initialData?.targetPlatforms || []);
  const [status, setStatus] = useState(initialData?.status || 'draft');
  const [scheduledAt, setScheduledAt] = useState(initialData?.scheduledAt || '');
  const [postId, setPostId] = useState(initialData?.id || null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState('');
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save drafts
  const autoSave = useCallback(async () => {
    if (!content.trim() || platforms.length === 0) return;

    setSaveStatus('saving');
    try {
      const url = postId ? `/api/posts/${postId}` : '/api/posts';
      const method = postId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, targetPlatforms: platforms, status: 'draft' }),
      });

      if (res.ok) {
        const data = await res.json();
        if (!postId) setPostId(data.post.id);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    }
  }, [content, platforms, postId]);

  // Debounced auto-save
  useEffect(() => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(autoSave, 3000);
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current); };
  }, [content, platforms, autoSave]);

  const handleTogglePlatform = (platform: string) => {
    setPlatforms(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  const handleSave = async () => {
    if (!content.trim()) { setError('Content cannot be empty'); return; }
    if (platforms.length === 0) { setError('Select at least one platform'); return; }

    setSaving(true);
    setError('');

    try {
      const url = postId ? `/api/posts/${postId}` : '/api/posts';
      const method = postId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, targetPlatforms: platforms, status: 'draft' }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push('/posts');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save');
      }
    } catch {
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleSchedule = async () => {
    if (!scheduledAt) { setError('Select a date and time to schedule'); return; }

    setSaving(true);
    setError('');

    try {
      const url = postId ? `/api/posts/${postId}` : '/api/posts';
      const method = postId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, targetPlatforms: platforms, status: 'scheduled', scheduledAt }),
      });

      if (res.ok) {
        router.push('/posts');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to schedule');
      }
    } catch {
      setError('Failed to schedule');
    } finally {
      setSaving(false);
    }
  };

  const validation = validatePostContent(content, platforms);

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>
          {mode === 'edit' ? 'Edit Post' : 'New Post'}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {saveStatus === 'saving' && <span style={{ fontSize: '12px', color: 'var(--foreground-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Save size={12} /> Saving...</span>}
          {saveStatus === 'saved' && <span style={{ fontSize: '12px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> Saved</span>}
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid var(--error)', borderRadius: 'var(--radius)', color: 'var(--error)', fontSize: '14px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {!validation.valid && platforms.length > 0 && (
        <div style={{ padding: '10px 14px', background: 'rgba(245,158,11,0.1)', border: '1px solid var(--warning)', borderRadius: 'var(--radius)', color: 'var(--warning)', fontSize: '13px', marginBottom: '16px' }}>
          {validation.errors.map((e, i) => <div key={i}>{e}</div>)}
        </div>
      )}

      {/* Editor */}
      <div style={{ marginBottom: '20px' }}>
        <PostEditor content={content} onChange={setContent} />
      </div>

      {/* Platform selector */}
      <div style={{ marginBottom: '20px' }}>
        <PlatformSelector selected={platforms} onToggle={handleTogglePlatform} content={content} />
      </div>

      {/* Schedule */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Clock size={18} style={{ color: 'var(--foreground-muted)' }} />
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--foreground-muted)', marginBottom: '4px' }}>Schedule for later</label>
            <input
              className="input"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              style={{ maxWidth: '280px' }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px' }}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save Draft'}
        </button>
        {scheduledAt && (
          <button onClick={handleSchedule} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: 'var(--warning)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 500 }}>
            <Clock size={16} /> Schedule
          </button>
        )}
      </div>
    </div>
  );
}
