import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: { 
    ssr: true 
  },
  test: {
    environment: 'node',
    globals: true,
    include: [
      'src/**/__tests__/**/*.test.ts', 
      'src/**/__tests__/**/*.spec.ts'
    ]
  }
})
