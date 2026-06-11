import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['utils/**/*.ts', 'composables/**/*.ts'],
      reporter: ['text', 'json-summary'],
    },
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, '.'),
    },
  },
});
