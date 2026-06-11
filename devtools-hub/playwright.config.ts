import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:3003',
    headless: true,
  },
  webServer: {
    command: 'pnpm dev -p 3003',
    url: 'http://localhost:3003',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
