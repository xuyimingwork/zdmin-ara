import { fileURLToPath, URL } from 'node:url'
import dts from 'vite-plugin-dts'
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
  plugins: [dts({ rollupTypes: true })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
