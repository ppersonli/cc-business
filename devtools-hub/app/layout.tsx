import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { SessionProvider } from '@/components/SessionProvider'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'DevTools Hub — Free Online Developer Tools',
    template: '%s | DevTools Hub',
  },
  description: '31+ free, client-side developer tools: JSON formatter, regex tester, JavaScript formatter, CSS flexbox generator, gradient generator, and more. No data sent to servers.',
  keywords: ['developer tools', 'online tools', 'JSON formatter', 'regex tester', 'base64 encoder', 'hash calculator', 'JWT decoder', 'CSS minifier', 'QR code generator', 'cron generator', 'password generator', 'UUID generator', 'SQL formatter', 'XML formatter', 'timestamp converter', 'gradient generator', 'box shadow generator', 'CSS grid generator', 'HTML table generator', 'regex cheatsheet', 'base converter', 'morse code', 'HTML preview', 'JSON to TypeScript', 'JSON to XML', 'TOML formatter', 'CSS beautifier', 'developer utilities'],
  authors: [{ name: 'DevTools Hub' }],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'DevTools Hub',
    url: 'https://tools.pixiaoli.cn',
    title: 'DevTools Hub — Free Online Developer Tools',
    description: '66+ free, client-side developer tools. JSON formatter, regex tester, JSON to XML, HTML preview, gradient generator, CSS grid generator, and more. Fast, private, no server calls.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevTools Hub — Free Online Developer Tools',
    description: '66+ free, client-side developer tools. JSON formatter, regex tester, JSON to XML, HTML preview, gradient generator, CSS grid generator, and more.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#3b82f6" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4440068978585381" crossOrigin="anonymous"></script>
      </head>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <SessionProvider>
          <Header />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  )
}
