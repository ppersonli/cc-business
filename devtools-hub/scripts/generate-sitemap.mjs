#!/usr/bin/env node
/**
 * Generates sitemap.xml from the tools list.
 * Run after build: node scripts/generate-sitemap.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_URL = 'https://tools.ovanime.com';
const TODAY = new Date().toISOString().split('T')[0];

// Read tools.ts and extract slugs
const toolsPath = resolve(__dirname, '../lib/tools.ts');
const content = readFileSync(toolsPath, 'utf-8');
const slugRegex = /slug:\s*'([^']+)'/g;
const slugs = [];
let match;
while ((match = slugRegex.exec(content)) !== null) {
  slugs.push(match[1]);
}

const urls = [
  { loc: SITE_URL + '/', changefreq: 'weekly', priority: '1.0' },
  ...slugs.map(slug => ({
    loc: `${SITE_URL}/tools/${slug}/`,
    changefreq: 'monthly',
    priority: '0.8',
  })),
  { loc: SITE_URL + '/privacy/', changefreq: 'yearly', priority: '0.3' },
  { loc: SITE_URL + '/terms/', changefreq: 'yearly', priority: '0.3' },
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

const outPath = resolve(__dirname, '../public/sitemap.xml');
writeFileSync(outPath, xml, 'utf-8');
console.log(`✅ sitemap.xml generated with ${urls.length} URLs → public/sitemap.xml`);
