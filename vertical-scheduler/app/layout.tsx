import type { Metadata } from 'next';
import './globals.css';

const BASE_URL = 'https://scheduler.ovanime.com';

export const metadata: Metadata = {
  title: { default: 'Vertical Scheduler — Industry-Specific Booking', template: '%s | Vertical Scheduler' },
  description: 'Scheduling and booking platform built for your industry — designers, fitness coaches, consultants. Not generic scheduling.',
  keywords: ['scheduling', 'booking', 'appointment', 'designer', 'fitness coach', 'consultant', 'calendar'],
  openGraph: {
    title: 'Vertical Scheduler — Industry-Specific Booking',
    description: 'Scheduling built for your industry — not generic scheduling.',
    url: BASE_URL,
    siteName: 'Vertical Scheduler',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vertical Scheduler',
    description: 'Scheduling built for your industry.',
  },
  alternates: {
    canonical: BASE_URL,
  },
  metadataBase: new URL(BASE_URL),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Vertical Scheduler',
              description: 'Industry-specific scheduling and booking platform',
              url: BASE_URL,
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Any',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
