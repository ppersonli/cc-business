/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '~': resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      include: ['utils/**/*.ts', 'composables/**/*.ts'],
      exclude: ['utils/payment.ts'],
      reporter: ['text', 'json-summary', 'html'],
    },
    setupFiles: ['tests/setup.ts'],
  },
});
