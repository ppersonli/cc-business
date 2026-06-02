'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from './SessionProvider';

export default function UserMenu() {
  const { user, logout } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  const displayName = user.name || user.email.split('@')[0];
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '4px 8px',
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'transparent',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
        }}
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={displayName}
            width={28}
            height={28}
            style={{ borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'var(--accent)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {initials}
          </div>
        )}
        <span style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 500 }}>
          {displayName}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{ color: 'var(--text-muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 8,
            minWidth: 200,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 8,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            zIndex: 100,
          }}
        >
          {/* User info */}
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              {displayName}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {user.email}
            </div>
            <div style={{
              display: 'inline-block',
              marginTop: 6,
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              background: user.isPro ? 'rgba(34,197,94,0.15)' : 'rgba(113,113,122,0.15)',
              color: user.isPro ? 'var(--success)' : 'var(--text-muted)',
            }}>
              {user.plan}
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={() => { setOpen(false); logout(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '8px 12px',
              borderRadius: 6,
              border: 'none',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 14H3.33C2.6 14 2 13.4 2 12.67V3.33C2 2.6 2.6 2 3.33 2H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M10.67 11.33L14 8L10.67 4.67" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
