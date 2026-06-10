'use client';

import { useState, useEffect } from 'react';

interface AvailabilityRule {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface Props {
  pageId: string;
  brandColor: string;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AvailabilityManager({ pageId, brandColor }: Props) {
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  useEffect(() => {
    fetch(`/api/pages/${pageId}/availability`)
      .then(res => res.json())
      .then(data => { setRules(data.rules || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [pageId]);

  const handleAdd = () => {
    setRules([...rules, { day_of_week: selectedDay, start_time: startTime, end_time: endTime }]);
  };

  const handleRemove = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/pages/${pageId}/availability`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rules: rules.map(r => ({ dayOfWeek: r.day_of_week, startTime: r.start_time, endTime: r.end_time })) }),
    });
    if (res.ok) {
      const data = await res.json();
      setRules(data.rules);
    }
    setSaving(false);
  };

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Loading availability...</p>;

  // Group rules by day
  const rulesByDay: Record<number, { start_time: string; end_time: string; index: number }[]> = {};
  rules.forEach((r, i) => {
    if (!rulesByDay[r.day_of_week]) rulesByDay[r.day_of_week] = [];
    rulesByDay[r.day_of_week].push({ ...r, index: i });
  });

  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Availability</h2>

      {/* Current rules */}
      <div style={{ marginBottom: '20px' }}>
        {DAY_NAMES.map((day, dayIndex) => {
          const dayRules = rulesByDay[dayIndex] || [];
          return (
            <div key={dayIndex} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ width: '80px', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{DAY_SHORT[dayIndex]}</span>
              <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {dayRules.length === 0 ? (
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Unavailable</span>
                ) : (
                  dayRules.map((r, i) => (
                    <span key={i} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '4px 10px', background: 'var(--accent-light)', borderRadius: '12px',
                      fontSize: '13px', color: brandColor, fontWeight: 500,
                    }}>
                      {r.start_time} - {r.end_time}
                      <button
                        onClick={() => handleRemove(r.index)}
                        style={{ background: 'none', border: 'none', color: brandColor, cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: '0 2px' }}
                      >&times;</button>
                    </span>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add rule */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Day</label>
            <select className="input" value={selectedDay} onChange={e => setSelectedDay(Number(e.target.value))} style={{ width: 'auto' }}>
              {DAY_NAMES.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Start</label>
            <input className="input" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={{ width: '110px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>End</label>
            <input className="input" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={{ width: '110px' }} />
          </div>
          <button className="btn" onClick={handleAdd} style={{ whiteSpace: 'nowrap' }}>+ Add</button>
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={handleSave}
        disabled={saving}
        style={{ background: brandColor, borderColor: brandColor }}
      >
        {saving ? 'Saving...' : 'Save Availability'}
      </button>
    </div>
  );
}
