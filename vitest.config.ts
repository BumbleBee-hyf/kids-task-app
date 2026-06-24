import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globalSetup: ['./server/globalSetup.js'],
    testTimeout: 15000,
    hookTimeout: 30000,
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'server/**/*.{test,spec}.{ts,js}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}', 'server/server.js'],
      exclude: [
        'src/main.tsx',
        'src/test/**',
        'src/types/**',
        'src/vite-env.d.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/node_modules/**',
      ],
    },
    server: {
      deps: {
        inline: [/^(?!.*node_modules).*$/],
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
