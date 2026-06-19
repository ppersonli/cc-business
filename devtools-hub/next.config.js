import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,
  serverExternalPackages: ['playwright', 'playwright-core', 'better-sqlite3', '@libsql/client'],
}

export default withNextIntl(nextConfig)
