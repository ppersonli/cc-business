'use client';

import { useState, useEffect } from 'react';

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number | null;
  currency: string;
}

interface BookingPage {
  id: string;
  title: string;
  description: string | null;
  brand_color: string;
  slug: string;
}

interface AvailabilityRule {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface Props {
  slug: string;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function generateTimeSlots(rules: AvailabilityRule[], dayOfWeek: number, durationMinutes: number, existingBookings: { start_time: string; end_time: string }[]): string[] {
  const dayRules = rules.filter(r => r.day_of_week === dayOfWeek);
  if (dayRules.length === 0) return [];

  const slots: string[] = [];
  for (const rule of dayRules) {
    const [startH, startM] = rule.start_time.split(':').map(Number);
    const [endH, endM] = rule.end_time.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    for (let m = startMinutes; m + durationMinutes <= endMinutes; m += durationMinutes) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const slotStart = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
      const slotEndMin = m + durationMinutes;
      const slotEnd = `${String(Math.floor(slotEndMin / 60)).padStart(2, '0')}:${String(slotEndMin % 60).padStart(2, '0')}`;

      // Check if slot overlaps with existing bookings
      const isBooked = existingBookings.some(b => {
        const bStart = b.start_time.split('T')[1]?.substring(0, 5);
        const bEnd = b.end_time.split('T')[1]?.substring(0, 5);
        return slotStart < bEnd! && slotEnd > bStart!;
      });

      if (!isBooked) {
        slots.push(slotStart);
      }
    }
  }
  return slots;
}

export default function PublicBookingPage({ slug }: Props) {
  const [page, setPage] = useState<BookingPage | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [availability, setAvailability] = useState<AvailabilityRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [step, setStep] = useState<'service' | 'datetime' | 'form' | 'done'>('service');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{ id: string } | null>(null);

  useEffect(() => {
    fetch(`/api/book/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setPage(data.page);
          setServices(data.services);
          setAvailability(data.availability);
        }
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');

    if (!selectedService) return;

    const d = new Date(date + 'T00:00:00');
    const dayOfWeek = d.getDay();
    const slots = generateTimeSlots(availability, dayOfWeek, selectedService.duration_minutes, []);
    setAvailableSlots(slots);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime) return;

    setSubmitting(true);
    try {
      const duration = selectedService.duration_minutes;
      const [h, m] = selectedTime.split(':').map(Number);
      const endMinutes = h * 60 + m + duration;
      const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;

      const res = await fetch(`/api/book/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          clientName,
          clientEmail,
          clientPhone: clientPhone || undefined,
          startTime: `${selectedDate}T${selectedTime}:00`,
          endTime: `${selectedDate}T${endTime}:00`,
          notes: notes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Booking failed');
      }

      const data = await res.json();
      setBookingResult(data.booking);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading...</div>;
  }

  if (error && !page) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>{error}</div>;
  }

  const brandColor = page?.brand_color || '#3b82f6';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: '560px', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{page?.title}</h1>
          {page?.description && <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>{page.description}</p>}
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {['service', 'datetime', 'form'].map((s, i) => (
            <div key={s} style={{
              flex: 1, height: '4px', borderRadius: '2px',
              background: ['service', 'datetime', 'form'].indexOf(step) >= i ? brandColor : 'var(--border)',
            }} />
          ))}
        </div>

        {/* Step 1: Select Service */}
        {step === 'service' && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Choose a service</h2>
            {services.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px' }}>No services available yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {services.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedService(s); setStep('datetime'); }}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '16px 20px', background: 'var(--bg-primary)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)', cursor: 'pointer', textAlign: 'left' as const,
                      transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = brandColor; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>{s.name}</div>
                      {s.description && <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.description}</div>}
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.duration_minutes} min</div>
                    </div>
                    {s.price_cents !== null && (
                      <div style={{ fontWeight: 600, fontSize: '16px', color: brandColor }}>
                        ${(s.price_cents / 100).toFixed(2)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 'datetime' && selectedService && (
          <div>
            <button onClick={() => setStep('service')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px', marginBottom: '12px' }}>
              &larr; Back
            </button>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>{selectedService.name}</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>{selectedService.duration_minutes} minutes</p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Select date</label>
              <input
                className="input"
                type="date"
                value={selectedDate}
                onChange={e => handleDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {selectedDate && (
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Select time</label>
                {availableSlots.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '16px 0' }}>No available slots for this date.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px' }}>
                    {availableSlots.map(slot => (
                      <button
                        key={slot}
                        onClick={() => { setSelectedTime(slot); setStep('form'); }}
                        style={{
                          padding: '10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                          background: selectedTime === slot ? brandColor : 'var(--bg-primary)',
                          color: selectedTime === slot ? '#fff' : 'var(--text-primary)',
                          cursor: 'pointer', fontSize: '14px', fontWeight: 500,
                        }}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Client Info */}
        {step === 'form' && (
          <div>
            <button onClick={() => setStep('datetime')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px', marginBottom: '12px' }}>
              &larr; Back
            </button>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Your details</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {selectedService?.name} on {selectedDate} at {selectedTime}
            </p>

            {error && (
              <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius)', color: '#991b1b', fontSize: '14px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Name *</label>
                <input className="input" type="text" value={clientName} onChange={e => setClientName(e.target.value)} required />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Email *</label>
                <input className="input" type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} required />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Phone</label>
                <input className="input" type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Notes</label>
                <textarea className="input" value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ resize: 'vertical' }} />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ width: '100%', justifyContent: 'center', padding: '12px', background: brandColor, borderColor: brandColor }}
              >
                {submitting ? 'Booking...' : 'Confirm Booking'}
              </button>
            </form>
          </div>
        )}

        {/* Step 4: Done */}
        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>&#10003;</div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Booking Confirmed!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>
              {selectedService?.name} on {selectedDate} at {selectedTime}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              A confirmation will be sent to {clientEmail}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
