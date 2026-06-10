'use client';

import { getCharLimit, getRemainingChars, stripHtml } from '@/lib/content/platform';

const PLATFORMS = [
  { id: 'twitter', name: 'Twitter/X', color: '#1DA1F2', icon: '𝕏' },
  { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2', icon: 'in' },
  { id: 'facebook', name: 'Facebook', color: '#1877F2', icon: 'f' },
  { id: 'instagram', name: 'Instagram', color: '#E4405F', icon: '📷' },
  { id: 'bluesky', name: 'Bluesky', color: '#0085FF', icon: '🦋' },
];

interface Props {
  selected: string[];
  onToggle: (platform: string) => void;
  content: string;
}

export default function PlatformSelector({ selected, onToggle, content }: Props) {
  const plainText = stripHtml(content);

  return (
    <div>
      <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--foreground-muted)', marginBottom: '8px' }}>
        Target Platforms
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {PLATFORMS.map((platform) => {
          const isSelected = selected.includes(platform.id);
          const limit = getCharLimit(platform.id);
          const remaining = limit - plainText.length;
          const isOver = remaining < 0;

          return (
            <button
              key={platform.id}
              onClick={() => onToggle(platform.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                padding: '10px 16px', borderRadius: 'var(--radius)',
                border: `2px solid ${isSelected ? platform.color : 'var(--border)'}`,
                background: isSelected ? platform.color + '10' : 'transparent',
                cursor: 'pointer', transition: 'all 0.15s', minWidth: '80px',
              }}
            >
              <span style={{ fontSize: '16px', fontWeight: 700, color: isSelected ? platform.color : 'var(--foreground-muted)' }}>
                {platform.icon}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 500, color: isSelected ? platform.color : 'var(--foreground-muted)' }}>
                {platform.name}
              </span>
              {isSelected && (
                <span style={{ fontSize: '11px', color: isOver ? 'var(--error)' : 'var(--foreground-muted)', fontWeight: isOver ? 600 : 400 }}>
                  {isOver ? `${Math.abs(remaining)} over` : `${remaining} left`}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
