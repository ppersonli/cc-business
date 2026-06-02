'use client'

import Link from 'next/link'
import LoginButton from '@/components/LoginButton'
import UserMenu from '@/components/UserMenu'
import { useSession } from '@/components/SessionProvider'

export default function Header() {
  const { user, loading } = useSession()
  return (
    <header style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 16px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          textDecoration: 'none',
          color: 'var(--text-primary)',
        }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 16,
            color: 'white',
          }}>
            D
          </div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>DevTools Hub</span>
        </Link>
        <nav style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
            Tools
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}
          >
            GitHub
          </a>
          {/* Auth section */}
          {!loading && (
            user ? <UserMenu /> : <LoginButton />
          )}
        </nav>
      </div>
    </header>
  )
}
