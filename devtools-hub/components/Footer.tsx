import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border)',
      padding: '24px 16px',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottom: '1px solid var(--border)',
        textAlign: 'center',
      }}>
        <a
          href="https://pixiaoli.cn"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}
        >
          {'  Check out our ACGN content platform: '}
          <span style={{ fontWeight: 600 }}>pixiaoli.cn</span>
        </a>
      </div>
      <div className="footer-inner" style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          DevTools Hub — Free online developer tools. 100% client-side, no data sent to servers.
        </span>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/terms" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>
            Terms of Service
          </Link>
          <Link href="/privacy" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>
            Privacy Policy
          </Link>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Built with Next.js + Tailwind CSS
          </span>
        </div>
      </div>
    </footer>
  )
}
