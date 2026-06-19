import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'SnapGen - AI Screenshot to Code',
    description: 'Screenshot → AI analysis: get descriptions, code, and UI feedback instantly',
    permissions: ['storage', 'sidePanel', 'commands', 'tabs', 'cookies'],
    host_permissions: ['https://api.openai.com/*', 'https://api.anthropic.com/*', 'https://tools.ovanime.com/*'],
    icons: {
      16: 'icon/icon-16.png',
      32: 'icon/icon-32.png',
      48: 'icon/icon-48.png',
      128: 'icon/icon-128.png',
    },
    action: {
      default_title: 'SnapGen',
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
