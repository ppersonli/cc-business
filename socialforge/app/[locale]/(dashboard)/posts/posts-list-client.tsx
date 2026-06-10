'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Edit, Trash2, Clock, Send, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { stripHtml } from '@/lib/content/platform';

interface Post {
  id: string;
  content: string;
  status: string;
  targetPlatforms: string[];
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<string, { icon: typeof FileText; color: string; label: string }> = {
  draft: { icon: FileText, color: 'var(--foreground-muted)', label: 'Draft' },
  scheduled: { icon: Clock, color: 'var(--warning)', label: 'Scheduled' },
  published: { icon: CheckCircle, color: 'var(--success)', label: 'Published' },
  failed: { icon: AlertCircle, color: 'var(--error)', label: 'Failed' },
};

export default function PostsListClient() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      const url = filter ? `/api/posts?status=${filter}` : '/api/posts';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, [filter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    if (res.ok) setPosts(prev => prev.filter(p => p.id !== id));
  };

  const handlePublish = async (id: string) => {
    if (!confirm('Publish this post now?')) return;
    const res = await fetch(`/api/posts/${id}/publish`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'published' } : p));
      } else {
        alert('Publish failed: ' + JSON.stringify(data.result));
        setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'failed' } : p));
      }
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--foreground-muted)', textAlign: 'center', padding: '48px' }}>Loading...</div>;
  }

  return (
    <>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {[null, 'draft', 'scheduled', 'published', 'failed'].map((status) => (
          <button
            key={status || 'all'}
            onClick={() => setFilter(status)}
            style={{
              padding: '6px 14px', border: '1px solid var(--border)', borderRadius: '20px',
              background: filter === status ? 'var(--primary)' : 'transparent',
              color: filter === status ? '#fff' : 'var(--foreground-muted)',
              fontSize: '13px', cursor: 'pointer',
            }}
          >
            {status ? STATUS_CONFIG[status]?.label || status : 'All'}
          </button>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--foreground-muted)' }}>
          <FileText size={40} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <p style={{ fontSize: '15px', marginBottom: '8px' }}>No posts yet</p>
          <p style={{ fontSize: '13px' }}>Create your first post to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {posts.map((post) => {
            const status = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft;
            const StatusIcon = status.icon;
            const preview = stripHtml(post.content).slice(0, 120);

            return (
              <div key={post.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  backgroundColor: status.color === 'var(--foreground-muted)' ? 'var(--background-secondary)' : status.color + '15',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <StatusIcon size={18} style={{ color: status.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {preview || 'Empty post'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--foreground-muted)' }}>
                    <span style={{ color: status.color, fontWeight: 500 }}>{status.label}</span>
                    <span>·</span>
                    <span>{post.targetPlatforms.join(', ')}</span>
                    {post.scheduledAt && (
                      <>
                        <span>·</span>
                        <span>Scheduled: {new Date(post.scheduledAt).toLocaleString()}</span>
                      </>
                    )}
                    <span>·</span>
                    <span>{new Date(post.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  {(post.status === 'draft' || post.status === 'scheduled') && (
                    <button
                      onClick={() => handlePublish(post.id)}
                      title="Publish Now"
                      style={{ padding: '6px', background: 'transparent', border: '1px solid var(--success)', borderRadius: 'var(--radius)', cursor: 'pointer', color: 'var(--success)' }}
                    >
                      <Send size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => router.push(`/posts/${post.id}`)}
                    title="Edit"
                    style={{ padding: '6px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', color: 'var(--foreground-muted)' }}
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    title="Delete"
                    style={{ padding: '6px', background: 'transparent', border: '1px solid var(--error)', borderRadius: 'var(--radius)', cursor: 'pointer', color: 'var(--error)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
