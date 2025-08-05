import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./pages/devtools/openapi-codegen-main.html', import.meta.url)),
        panel: fileURLToPath(new URL('./pages/devtools/openapi-codegen-panel.html', import.meta.url))
      }
    }
  },
  plugins: [
    vue(), 
    vueJsx(),
    AutoImport({
      imports: ['vue', 'vue-router'],
      resolvers: [
        ElementPlusResolver()
      ],
    }),
    Components({
      resolvers: [
        ElementPlusResolver(),
        (name) =>  name === 'Icon' ? { name: 'Icon', from: '@iconify/vue' } : undefined,
      ],
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
