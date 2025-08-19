import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  build: {
    ssr: true,
    lib: {
      entry: fileURLToPath(new URL('./src/app.ts', import.meta.url)),
      formats: ['es']
    },
  },
  plugins: [],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
