import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'ExtensionShield - Chrome Extension Security Scanner',
    description:
      'Scan and audit Chrome extensions for security risks. CASA pre-scanning, permission analysis, and vulnerability detection.',
    permissions: [
      'management',
      'storage',
      'activeTab',
      'cookies',
    ],
    host_permissions: ['https://tools.pixiaoli.cn/*'],
    icons: {
      16: 'icon/icon-16.png',
      32: 'icon/icon-32.png',
      48: 'icon/icon-48.png',
      128: 'icon/icon-128.png',
    },
    action: {
      default_title: 'ExtensionShield',
      default_icon: {
        16: 'icon/icon-16.png',
        32: 'icon/icon-32.png',
        48: 'icon/icon-48.png',
      },
    },
    side_panel: {
      default_path: 'sidepanel.html',
    },
  },
});
