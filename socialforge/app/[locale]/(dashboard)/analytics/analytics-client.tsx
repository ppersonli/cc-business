'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { BarChart3, TrendingUp, Users, Eye, Heart, MessageCircle, Share2, MousePointer, Download } from 'lucide-react';

interface OverviewData {
  overview: {
    totalPosts: number;
    postsByStatus: { draft: number; scheduled: number; published: number; failed: number };
    connectedAccounts: number;
    totalFollowers: number;
    aiGenerationsUsed: number;
    aiTokensUsed: number;
  };
  engagement: {
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalImpressions: number;
    totalClicks: number;
    engagementRate: string;
  };
  accounts: { id: string; platform: string; username: string; status: string }[];
}

const COLORS = ['#7c3aed', '#a855f7', '#22c55e', '#f59e0b', '#ef4444'];
const STATUS_COLORS = { draft: '#71717a', scheduled: '#f59e0b', published: '#22c55e', failed: '#ef4444' };

export default function AnalyticsClient() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics/overview');
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  const handleExportCSV = async () => {
    if (!data) return;
    const rows = [
      ['Metric', 'Value'],
      ['Total Posts', data.overview.totalPosts],
      ['Draft Posts', data.overview.postsByStatus.draft],
      ['Scheduled Posts', data.overview.postsByStatus.scheduled],
      ['Published Posts', data.overview.postsByStatus.published],
      ['Failed Posts', data.overview.postsByStatus.failed],
      ['Connected Accounts', data.overview.connectedAccounts],
      ['Total Followers', data.overview.totalFollowers],
      ['Total Likes', data.engagement.totalLikes],
      ['Total Comments', data.engagement.totalComments],
      ['Total Shares', data.engagement.totalShares],
      ['Total Impressions', data.engagement.totalImpressions],
      ['Total Clicks', data.engagement.totalClicks],
      ['Engagement Rate', data.engagement.engagementRate + '%'],
      ['AI Generations Used', data.overview.aiGenerationsUsed],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'socialforge-analytics.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div style={{ color: 'var(--foreground-muted)', textAlign: 'center', padding: '48px' }}>Loading analytics...</div>;
  }

  if (!data) {
    return <div style={{ color: 'var(--foreground-muted)', textAlign: 'center', padding: '48px' }}>Failed to load analytics.</div>;
  }

  const statusData = Object.entries(data.overview.postsByStatus).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: STATUS_COLORS[name as keyof typeof STATUS_COLORS] || '#71717a',
  }));

  const engagementData = [
    { name: 'Likes', value: data.engagement.totalLikes, color: '#ef4444' },
    { name: 'Comments', value: data.engagement.totalComments, color: '#3b82f6' },
    { name: 'Shares', value: data.engagement.totalShares, color: '#22c55e' },
    { name: 'Clicks', value: data.engagement.totalClicks, color: '#f59e0b' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Analytics</h1>
        <button onClick={handleExportCSV} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total Posts', value: data.overview.totalPosts, icon: BarChart3, color: 'var(--primary)' },
          { label: 'Impressions', value: data.engagement.totalImpressions.toLocaleString(), icon: Eye, color: '#3b82f6' },
          { label: 'Engagement', value: data.engagement.engagementRate + '%', icon: TrendingUp, color: '#22c55e' },
          { label: 'Followers', value: data.overview.totalFollowers.toLocaleString(), icon: Users, color: '#a855f7' },
          { label: 'Likes', value: data.engagement.totalLikes.toLocaleString(), icon: Heart, color: '#ef4444' },
          { label: 'Comments', value: data.engagement.totalComments.toLocaleString(), icon: MessageCircle, color: '#f59e0b' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Icon size={16} style={{ color: stat.color }} />
                <span style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Post Status Distribution */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Post Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Engagement Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--foreground-muted)" fontSize={12} />
              <YAxis stroke="var(--foreground-muted)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {engagementData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Connected Accounts */}
      {data.accounts.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>Connected Accounts</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {data.accounts.map((account) => (
              <div key={account.id} style={{
                padding: '8px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px',
              }}>
                <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{account.platform}</span>
                <span style={{ color: 'var(--foreground-muted)' }}>@{account.username}</span>
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: account.status === 'active' ? 'var(--success)' : 'var(--error)',
                }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
