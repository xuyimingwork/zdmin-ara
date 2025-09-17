import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import OpenAPI from '@zdmin/ara-unplugin/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    OpenAPI({
      docs: {
        v2: 'https://petstore.swagger.io/',
        v3: 'https://petstore3.swagger.io/'
      }
    })
    
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
