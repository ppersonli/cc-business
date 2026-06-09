import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'TabMaster AI — Smart Tab Manager',
    description: 'AI-powered tab management, search, and workflow automation for Chrome power users',
    permissions: ['storage', 'sidePanel', 'tabs', 'cookies', 'commands'],
    host_permissions: ['https://tools.pixiaoli.cn/*', 'https://api.openai.com/*'],
    side_panel: {
      default_path: 'sidepanel/index.html',
    },
    action: {
      default_title: 'TabMaster AI',
    },
    commands: {
      _execute_side_panel: {
        suggested_key: {
          default: 'Ctrl+Shift+T',
          mac: 'Command+Shift+T',
        },
        description: 'Open TabMaster AI',
      },
    },
  },
});
