import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['app/**/__tests__/**/*.test.ts', 'lib/**/__tests__/**/*.test.ts'],
  },
})
