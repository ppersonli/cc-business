import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      include: ['utils/**/*.ts'],
      exclude: [],
      reporter: ['text', 'json-summary', 'html'],
    },
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, '.'),
    },
  },
});
