import { defineConfig } from 'vitest/config'

// biome-ignore lint/style/noDefaultExport: expected by vitest
export default defineConfig({
  test: {
    globals: true,
    watch: false,
    restoreMocks: true,
    passWithNoTests: true,
    pool: 'threads',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts'],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
})
