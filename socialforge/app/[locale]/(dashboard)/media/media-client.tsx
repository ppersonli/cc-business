'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, Image, Film, FileIcon, Copy, CheckCircle } from 'lucide-react';

interface MediaAsset {
  id: string;
  filename: string;
  blobUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

export default function MediaLibraryClient() {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        setMedia(data.media || []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchMedia(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/media', { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          setMedia(prev => [data.media, ...prev]);
        } else {
          const data = await res.json();
          alert(data.error || 'Upload failed');
        }
      } catch {
        alert('Upload failed');
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this media asset?')) return;
    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      if (res.ok) setMedia(prev => prev.filter(m => m.id !== id));
    } catch { /* ignore */ }
  };

  const handleCopyUrl = async (id: string, url: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType.startsWith('video/')) return Film;
    return FileIcon;
  };

  if (loading) {
    return <div style={{ color: 'var(--foreground-muted)', textAlign: 'center', padding: '48px' }}>Loading...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Media Library</h1>
        <div>
          <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple onChange={handleUpload} style={{ display: 'none' }} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px' }}
          >
            <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--foreground-muted)', marginBottom: '16px' }}>
        Supported: JPEG, PNG, GIF, WebP, MP4, WebM · Max 10MB per file
      </p>

      {media.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '64px', color: 'var(--foreground-muted)' }}>
          <Upload size={40} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <p style={{ fontSize: '15px', marginBottom: '8px' }}>No media uploaded yet</p>
          <p style={{ fontSize: '13px' }}>Upload images and videos to use in your posts.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {media.map((asset) => {
            const Icon = getIcon(asset.fileType);
            const isImage = asset.fileType.startsWith('image/');

            return (
              <div key={asset.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                {/* Preview */}
                <div style={{ height: '160px', backgroundColor: 'var(--background-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {isImage ? (
                    <img src={asset.blobUrl} alt={asset.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Icon size={40} style={{ color: 'var(--foreground-muted)' }} />
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>
                    {asset.filename}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--foreground-muted)', marginBottom: '8px' }}>
                    {formatFileSize(asset.fileSize)} · {asset.fileType.split('/')[1]}
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => handleCopyUrl(asset.id, asset.blobUrl)}
                      title="Copy URL"
                      style={{ flex: 1, padding: '4px 8px', fontSize: '11px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', color: 'var(--foreground-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}
                    >
                      {copiedId === asset.id ? <><CheckCircle size={11} /> Copied</> : <><Copy size={11} /> URL</>}
                    </button>
                    <button
                      onClick={() => handleDelete(asset.id)}
                      title="Delete"
                      style={{ padding: '4px 8px', fontSize: '11px', background: 'transparent', border: '1px solid var(--error)', borderRadius: '4px', cursor: 'pointer', color: 'var(--error)' }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
