'use client';

import { useState, useEffect } from 'react';
import { Share2, Twitter, Linkedin, Trash2, RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  status: string;
  expiresAt: string | null;
  createdAt: string;
}

const PLATFORM_ICONS: Record<string, typeof Twitter> = {
  twitter: Twitter,
  linkedin: Linkedin,
};

const PLATFORM_COLORS: Record<string, string> = {
  twitter: '#1DA1F2',
  linkedin: '#0A66C2',
};

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  active: { icon: CheckCircle, color: 'var(--success)', label: 'Connected' },
  expired: { icon: Clock, color: 'var(--warning)', label: 'Expired' },
  error: { icon: AlertCircle, color: 'var(--error)', label: 'Error' },
};

export default function AccountsClient() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/accounts');
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  };

  useEffect(() => { fetchAccounts(); }, []);

  const handleConnect = (platform: string) => {
    setConnecting(platform);
    window.location.href = `/api/accounts/connect/${platform}`;
  };

  const handleDisconnect = async (accountId: string) => {
    if (!confirm('Disconnect this account?')) return;
    const res = await fetch(`/api/accounts/${accountId}`, { method: 'DELETE' });
    if (res.ok) setAccounts(accounts.filter(a => a.id !== accountId));
  };

  if (loading) {
    return <div style={{ color: 'var(--foreground-muted)', textAlign: 'center', padding: '48px' }}>Loading...</div>;
  }

  const connectedPlatforms = new Set(accounts.map(a => a.platform));
  const allPlatforms = ['twitter', 'linkedin'];

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Connected Accounts</h1>
      <p style={{ color: 'var(--foreground-muted)', marginBottom: '24px', fontSize: '14px' }}>
        Connect your social media accounts to schedule and publish posts.
      </p>

      {/* Available platforms */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', marginBottom: '32px' }}>
        {allPlatforms.map((platform) => {
          const isConnected = connectedPlatforms.has(platform);
          const Icon = PLATFORM_ICONS[platform] || Share2;
          const color = PLATFORM_COLORS[platform] || 'var(--primary)';

          return (
            <div key={platform} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', opacity: isConnected ? 0.6 : 1 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={24} style={{ color }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '15px', textTransform: 'capitalize' }}>{platform}</div>
                <div style={{ fontSize: '13px', color: 'var(--foreground-muted)' }}>{isConnected ? 'Already connected' : 'Click to connect'}</div>
              </div>
              {!isConnected && (
                <button
                  onClick={() => handleConnect(platform)}
                  disabled={connecting === platform}
                  style={{ padding: '8px 16px', borderRadius: 'var(--radius)', background: color, color: '#fff', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {connecting === platform ? 'Connecting...' : 'Connect'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Connected accounts */}
      {accounts.length > 0 && (
        <>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>Your Accounts</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {accounts.map((account) => {
              const Icon = PLATFORM_ICONS[account.platform] || Share2;
              const color = PLATFORM_COLORS[account.platform] || 'var(--primary)';
              const status = STATUS_CONFIG[account.status] || STATUS_CONFIG.active;
              const StatusIcon = status.icon;

              return (
                <div key={account.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} style={{ color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>@{account.username}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--foreground-muted)', marginTop: '2px' }}>
                      <span style={{ textTransform: 'capitalize' }}>{account.platform}</span>
                      <span>·</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: status.color }}>
                        <StatusIcon size={12} /> {status.label}
                      </span>
                      {account.expiresAt && (
                        <>
                          <span>·</span>
                          <span>Expires {new Date(account.expiresAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => fetchAccounts()} title="Refresh" style={{ padding: '6px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', color: 'var(--foreground-muted)' }}>
                      <RefreshCw size={14} />
                    </button>
                    <button onClick={() => handleDisconnect(account.id)} title="Disconnect" style={{ padding: '6px', background: 'transparent', border: '1px solid var(--error)', borderRadius: 'var(--radius)', cursor: 'pointer', color: 'var(--error)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {accounts.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--foreground-muted)' }}>
          <Share2 size={40} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <p style={{ fontSize: '15px', marginBottom: '8px' }}>No accounts connected yet</p>
          <p style={{ fontSize: '13px' }}>Connect a platform above to start scheduling posts.</p>
        </div>
      )}
    </div>
  );
}
