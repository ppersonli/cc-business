'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import type { CreateBookingPageInput } from '@/types/booking-page';

interface Props {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    brand_color: string;
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function BookingPageForm({ initialData }: Props) {
  const t = useTranslations('pages.form');
  const router = useRouter();
  const isEdit = !!initialData;

  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [brandColor, setBrandColor] = useState(initialData?.brand_color || '#3b82f6');
  const [slugEdited, setSlugEdited] = useState(!!initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugEdited) {
      setSlug(slugify(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const body: CreateBookingPageInput = { title, slug, description, brandColor };
      const url = isEdit ? `/api/pages/${initialData!.id}` : '/api/pages';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      router.push('/dashboard/pages');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '480px' }}>
      {error && (
        <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius)', color: '#991b1b', fontSize: '14px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
          {t('pageTitle')}
        </label>
        <input
          className="input"
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder={t('pageTitlePlaceholder')}
          required
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
          {t('slug')}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
          <span style={{ padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRight: 'none', borderRadius: 'var(--radius) 0 0 var(--radius)', fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            /book/
          </span>
          <input
            className="input"
            type="text"
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
            placeholder={t('slugPlaceholder')}
            style={{ borderRadius: '0 var(--radius) var(--radius) 0' }}
            required
            pattern="[a-z0-9-]+"
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
          {t('description')}
        </label>
        <textarea
          className="input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('descriptionPlaceholder')}
          rows={3}
          style={{ resize: 'vertical' }}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
          {t('brandColor')}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="color"
            value={brandColor}
            onChange={(e) => setBrandColor(e.target.value)}
            style={{ width: '40px', height: '40px', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer' }}
          />
          <input
            className="input"
            type="text"
            value={brandColor}
            onChange={(e) => setBrandColor(e.target.value)}
            style={{ width: '120px' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : isEdit ? 'Update Page' : 'Create Page'}
        </button>
        <button type="button" className="btn" onClick={() => router.push('/dashboard/pages')}>
          Cancel
        </button>
      </div>
    </form>
  );
}
