import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'SellSmart - E-Commerce Seller Research',
    description:
      'Research products, calculate profits, and compare platform fees across Etsy, Amazon, Shopify, and TikTok Shop.',
    permissions: ['storage', 'activeTab'],
    action: {
      default_title: 'SellSmart',
    },
    icons: {
      '16': 'icon/icon-16.png',
      '32': 'icon/icon-32.png',
      '48': 'icon/icon-48.png',
      '128': 'icon/icon-128.png',
    },
  },
});
