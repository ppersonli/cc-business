import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'SocialForge — Social Media Management', template: '%s | SocialForge' },
  description: 'Open-source social media management tool — schedule, publish, and analyze across platforms.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
