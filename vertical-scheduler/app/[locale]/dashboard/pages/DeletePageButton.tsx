'use client';

import { useRouter } from '@/i18n/navigation';

export default function DeletePageButton({ pageId }: { pageId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this page?')) return;
    const res = await fetch(`/api/pages/${pageId}`, { method: 'DELETE' });
    if (res.ok) router.refresh();
  };

  return (
    <button className="btn btn-danger" onClick={handleDelete} style={{ fontSize: '13px', padding: '6px 12px' }}>
      Delete
    </button>
  );
}
