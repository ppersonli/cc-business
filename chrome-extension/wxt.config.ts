import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'ScreenMind - AI Screenshot Analyzer',
    description: 'Screenshot → AI analysis: get descriptions, code, and UI feedback instantly',
    permissions: ['activeTab', 'storage', 'contextMenus', 'scripting', 'notifications', 'sidePanel', 'commands'],
    host_permissions: ['https://*/*', 'https://api.openai.com/*', 'https://api.anthropic.com/*'],
    icons: {
      16: 'icon/icon-16.png',
      32: 'icon/icon-32.png',
      48: 'icon/icon-48.png',
      128: 'icon/icon-128.png',
    },
    action: {
      default_title: 'ScreenMind',
      default_icon: {
        16: 'icon/icon-16.png',
        32: 'icon/icon-32.png',
        48: 'icon/icon-48.png',
      },
    },
    side_panel: {
      default_path: 'sidepanel.html',
    },
    commands: {
      'capture-screenshot': {
        suggested_key: {
          default: 'Ctrl+Shift+S',
          mac: 'Command+Shift+S',
        },
        description: 'Capture & analyze screenshot',
      },
    },
  },
});
