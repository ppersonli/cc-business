import type { Metadata } from 'next';
import './globals.css';

const BASE_URL = 'https://socialforge.app';

export const metadata: Metadata = {
  title: { default: 'SocialForge — Social Media Management', template: '%s | SocialForge' },
  description: 'Open-source social media management tool — schedule, publish, and analyze across platforms. Free tier available.',
  keywords: ['social media management', 'scheduler', 'content creator', 'social media tool', 'open source', 'buffer alternative'],
  openGraph: {
    title: 'SocialForge — Social Media Management, Simplified',
    description: 'Schedule, publish, and analyze across all platforms from one dashboard. Open source, free tier available.',
    url: BASE_URL,
    siteName: 'SocialForge',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SocialForge — Social Media Management',
    description: 'Schedule, publish, and analyze across all platforms. Open source.',
  },
  alternates: {
    canonical: BASE_URL,
  },
  metadataBase: new URL(BASE_URL),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
