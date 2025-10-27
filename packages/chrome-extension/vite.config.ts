import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import tailwindcss from '@tailwindcss/vite'
import { ManifestVersion } from './build/plugins/manifest-version'
import { Zip } from './build/plugins/zip'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./pages/devtools/openapi-codegen-main.html', import.meta.url)),
        panel: fileURLToPath(new URL('./pages/devtools/openapi-codegen-panel.html', import.meta.url)),
        popup: fileURLToPath(new URL('./pages/popups/openapi-codegen-popup.html', import.meta.url))
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
        @use "@/styles/scss/additional/global.scss" as *;
        `,
      },
    },
  },
  plugins: [
    vue(),
    vueJsx(),
    tailwindcss(),
    AutoImport({
      imports: ['vue', 'vue-router'],
      resolvers: [
        ElementPlusResolver({ importStyle: 'sass' })
      ],
    }),
    Components({
      resolvers: [
        ElementPlusResolver({ importStyle: 'sass' }),
        (name) => name === 'Icon' ? { name: 'Icon', from: '@iconify/vue' } : undefined,
      ],
    }),
    ManifestVersion(),
    Zip()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
})
