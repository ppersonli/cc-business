'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { stripHtml } from '@/lib/content/platform';

interface Post {
  id: string;
  content: string;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  targetPlatforms: string[];
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'var(--foreground-muted)',
  scheduled: 'var(--warning)',
  published: 'var(--success)',
  failed: 'var(--error)',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarClient() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/posts?limit=100');
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: (number | null)[] = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= totalDays; d++) days.push(d);
    return days;
  }, [year, month]);

  const postsByDate = useMemo(() => {
    const map: Record<string, Post[]> = {};
    for (const post of posts) {
      const dateStr = post.scheduledAt || post.publishedAt || post.createdAt;
      const date = new Date(dateStr);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(post);
    }
    return map;
  }, [posts]);

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  const selectedPosts = selectedDate
    ? postsByDate[`${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`] || []
    : [];

  const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => { setCurrentDate(new Date()); setSelectedDate(new Date()); };

  if (loading) {
    return <div style={{ color: 'var(--foreground-muted)', textAlign: 'center', padding: '48px' }}>Loading...</div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Calendar</h1>

      {/* Calendar header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={goToPrevMonth} style={{ padding: '6px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', color: 'var(--foreground-muted)' }}>
            <ChevronLeft size={18} />
          </button>
          <h2 style={{ fontSize: '18px', fontWeight: 600, minWidth: '180px', textAlign: 'center' }}>
            {MONTHS[month]} {year}
          </h2>
          <button onClick={goToNextMonth} style={{ padding: '6px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', color: 'var(--foreground-muted)' }}>
            <ChevronRight size={18} />
          </button>
        </div>
        <button onClick={goToToday} style={{ padding: '6px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', color: 'var(--foreground-muted)', fontSize: '13px' }}>
          Today
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', marginBottom: '1px' }}>
        {DAYS.map((day) => (
          <div key={day} style={{ padding: '8px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--foreground-muted)', backgroundColor: 'var(--background-secondary)' }}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: 'var(--border)' }}>
        {calendarDays.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} style={{ backgroundColor: 'var(--background)', minHeight: '100px' }} />;
          }

          const dateKey = `${year}-${month}-${day}`;
          const dayPosts = postsByDate[dateKey] || [];
          const isToday = dateKey === todayKey;
          const isSelected = selectedDate && `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}` === dateKey;

          return (
            <div
              key={dateKey}
              onClick={() => setSelectedDate(new Date(year, month, day))}
              style={{
                backgroundColor: isSelected ? 'var(--primary)' + '10' : 'var(--background)',
                minHeight: '100px',
                padding: '6px',
                cursor: 'pointer',
                border: isToday ? '2px solid var(--primary)' : '2px solid transparent',
                transition: 'background 0.15s',
              }}
            >
              <div style={{
                fontSize: '13px',
                fontWeight: isToday ? 700 : 400,
                color: isToday ? 'var(--primary)' : 'var(--foreground)',
                marginBottom: '4px',
              }}>
                {day}
              </div>
              {dayPosts.slice(0, 3).map((post) => {
                const color = STATUS_COLORS[post.status] || 'var(--foreground-muted)';
                const preview = stripHtml(post.content).slice(0, 30);
                return (
                  <div
                    key={post.id}
                    onClick={(e) => { e.stopPropagation(); router.push(`/posts/${post.id}`); }}
                    style={{
                      fontSize: '10px',
                      padding: '2px 4px',
                      marginBottom: '2px',
                      borderRadius: '3px',
                      backgroundColor: color + '15',
                      borderLeft: `2px solid ${color}`,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: 'var(--foreground)',
                    }}
                    title={preview}
                  >
                    {preview || 'Empty'}
                  </div>
                );
              })}
              {dayPosts.length > 3 && (
                <div style={{ fontSize: '10px', color: 'var(--foreground-muted)', padding: '0 4px' }}>
                  +{dayPosts.length - 3} more
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected date details */}
      {selectedDate && (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
          {selectedPosts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--foreground-muted)' }}>
              No posts on this day
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedPosts.map((post) => {
                const color = STATUS_COLORS[post.status] || 'var(--foreground-muted)';
                const StatusIcon = post.status === 'published' ? CheckCircle : post.status === 'failed' ? AlertCircle : post.status === 'scheduled' ? Clock : FileText;

                return (
                  <div key={post.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer' }} onClick={() => router.push(`/posts/${post.id}`)}>
                    <StatusIcon size={16} style={{ color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {stripHtml(post.content).slice(0, 80) || 'Empty post'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--foreground-muted)', marginTop: '2px' }}>
                        {post.targetPlatforms.join(', ')}
                        {post.scheduledAt && ` · ${new Date(post.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
