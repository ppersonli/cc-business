import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'WebMind - AI Highlight & Knowledge',
    description: 'Highlight, annotate, and organize web content with AI-powered knowledge management.',
    version: '0.1.0',
    permissions: ['storage', 'activeTab', 'contextMenus', 'tabs'],
    action: {
      default_title: 'WebMind',
    },
    icons: {
      '16': 'icon/16.png',
      '32': 'icon/32.png',
      '48': 'icon/48.png',
      '128': 'icon/128.png',
    },
  },
});
