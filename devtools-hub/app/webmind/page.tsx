import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WebMind — AI-Powered Web Highlighting & Knowledge Management',
  description: 'Highlight, annotate, and organize web content with WebMind Chrome extension. Export highlights as JSON/HTML, search and filter by page.',
  openGraph: {
    title: 'WebMind — AI-Powered Web Highlighting & Knowledge Management',
    description: 'Highlight, annotate, and organize web content with WebMind Chrome extension.',
  },
}

const FEATURES = [
  { icon: '🖍️', title: 'Smart Highlighting', desc: 'Select text on any webpage and highlight with 6 color options via right-click context menu.' },
  { icon: '📝', title: 'Notes & Annotations', desc: 'Add personal notes to any highlight for future reference.' },
  { icon: '🔍', title: 'Search & Filter', desc: 'Search across all highlights, filter by page, color, or date.' },
  { icon: '📊', title: 'Page Grouping', desc: 'Highlights automatically grouped by webpage for easy browsing.' },
  { icon: '💾', title: 'Export Anywhere', desc: 'Export highlights as JSON or HTML files for backup and sharing.' },
  { icon: '🔒', title: '100% Private', desc: 'All data stored locally in your browser. No servers, no tracking.' },
]

const STEPS = [
  { num: '1', title: 'Install Extension', desc: 'Add WebMind to Chrome from the Chrome Web Store.' },
  { num: '2', title: 'Highlight Text', desc: 'Select any text on a webpage, right-click, and choose "Highlight with WebMind".' },
  { num: '3', title: 'Organize & Export', desc: 'Search, filter, and export your highlights anytime.' },
]

export default function WebMindPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', maxWidth: '1200px', margin: '0 auto' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '14px', textDecoration: 'none' }}>
          ← DevTools Hub
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>WebMind</span>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '80px 24px 60px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'inline-block', padding: '6px 16px', backgroundColor: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '20px', fontSize: '13px', color: '#a78bfa', marginBottom: '24px' }}>
          Chrome Extension — Free & Open Source
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, color: '#f8fafc', lineHeight: 1.1, marginBottom: '24px' }}>
          Highlight, Annotate &<br />
          <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Organize Your Web Knowledge
          </span>
        </h1>
        <p style={{ fontSize: '18px', color: '#94a3b8', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 32px' }}>
          WebMind turns passive browsing into active knowledge management. Highlight important content, add notes, and export your research — all stored privately in your browser.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://chrome.google.com/webstore" target="_blank" rel="noopener"
            style={{ padding: '14px 32px', backgroundColor: '#8b5cf6', color: '#fff', borderRadius: '10px', fontSize: '16px', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>
            Install on Chrome
          </a>
          <a href="#features" style={{ padding: '14px 32px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '16px', fontWeight: 600, textDecoration: 'none' }}>
            Learn More ↓
          </a>
        </div>
      </section>

      {/* Demo Preview */}
      <section style={{ maxWidth: '700px', margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            <span style={{ fontWeight: 700, color: '#8b5cf6' }}>WebMind</span>
            <span style={{ fontSize: '12px', color: '#64748b', marginLeft: 'auto' }}>3 highlights · 2 pages</span>
          </div>
          {[
            { color: 'rgba(254, 240, 138, 0.4)', text: 'Next.js is a React framework for building full-stack web applications.', domain: 'nextjs.org', date: '2h ago' },
            { color: 'rgba(147, 197, 253, 0.4)', text: 'Turborepo is a high-performance build system for JavaScript and TypeScript codebases.', domain: 'turbo.build', date: '5h ago' },
            { color: 'rgba(134, 239, 172, 0.4)', text: 'Playwright enables reliable end-to-end testing for modern web apps.', domain: 'playwright.dev', date: '1d ago' },
          ].map((h, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px', borderRadius: '8px', marginBottom: '4px' }}>
              <div style={{ width: '4px', backgroundColor: h.color, borderRadius: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.5 }}>{h.text}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{h.domain} · {h.date}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 700, color: '#f8fafc', marginBottom: '48px' }}>
          Everything You Need for Web Research
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ padding: '24px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 700, color: '#f8fafc', marginBottom: '48px' }}>
          How It Works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {STEPS.map((s) => (
            <div key={s.num} style={{ textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '20px', fontWeight: 700, color: '#8b5cf6' }}>
                {s.num}
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>{s.title}</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.5 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '60px 24px 80px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
          Ready to Organize Your Web Knowledge?
        </h2>
        <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '32px' }}>
          Free, private, and open source. No account required.
        </p>
        <a href="https://chrome.google.com/webstore" target="_blank" rel="noopener"
          style={{ padding: '16px 40px', backgroundColor: '#8b5cf6', color: '#fff', borderRadius: '10px', fontSize: '18px', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
          Install WebMind — It's Free
        </a>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
        <a href="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>DevTools Hub</a> · WebMind — Built with Next.js + WXT
      </footer>
    </div>
  )
}
