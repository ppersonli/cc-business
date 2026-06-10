'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number | null;
  currency: string;
}

interface Props {
  pageId: string;
  brandColor: string;
}

export default function ServiceManager({ pageId, brandColor }: Props) {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [priceCents, setPriceCents] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    const res = await fetch(`/api/services?pageId=${pageId}`);
    const data = await res.json();
    setServices(data.services || []);
    setLoading(false);
  };

  useEffect(() => { fetchServices(); }, [pageId]);

  const resetForm = () => {
    setName(''); setDescription(''); setDurationMinutes(30); setPriceCents('');
    setShowForm(false); setEditingId(null);
  };

  const handleEdit = (s: Service) => {
    setName(s.name); setDescription(s.description || '');
    setDurationMinutes(s.duration_minutes);
    setPriceCents(s.price_cents !== null ? String(s.price_cents) : '');
    setEditingId(s.id); setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const body = {
      name, description: description || undefined,
      durationMinutes, priceCents: priceCents ? parseInt(priceCents) : undefined,
      ...(editingId ? {} : { pageId }),
    };

    const url = editingId ? `/api/services/${editingId}` : '/api/services';
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });

    if (res.ok) {
      resetForm();
      fetchServices();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    await fetch(`/api/services/${id}`, { method: 'DELETE' });
    fetchServices();
  };

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Loading services...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Services</h2>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
            + Add Service
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="card" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>
            {editingId ? 'Edit Service' : 'New Service'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Name *</label>
              <input className="input" type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Consultation" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Duration (min) *</label>
              <input className="input" type="number" value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))} required min={5} />
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Description</label>
            <input className="input" type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" />
          </div>
          <div style={{ marginBottom: '16px', maxWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Price (cents)</label>
            <input className="input" type="number" value={priceCents} onChange={e => setPriceCents(e.target.value)} placeholder="e.g. 5000" min={0} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ background: brandColor, borderColor: brandColor }}>
              {saving ? 'Saving...' : editingId ? 'Update' : 'Add Service'}
            </button>
            <button type="button" className="btn" onClick={resetForm}>Cancel</button>
          </div>
        </form>
      )}

      {services.length === 0 && !showForm ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>No services yet. Add one to start accepting bookings.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {services.map(s => (
            <div key={s.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{s.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {s.duration_minutes}min
                  {s.price_cents !== null && ` · $${(s.price_cents / 100).toFixed(2)}`}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="btn" onClick={() => handleEdit(s)} style={{ padding: '4px 10px', fontSize: '12px' }}>Edit</button>
                <button className="btn btn-danger" onClick={() => handleDelete(s.id)} style={{ padding: '4px 10px', fontSize: '12px' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
