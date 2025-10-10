import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import tailwindcss from '@tailwindcss/vite'
import { version } from './package.json'
import { readFile, writeFile } from 'node:fs/promises'
const GREEK_MAP = { alpha: 100, beta: 200 } as const

function change(pkg: string) {
  return readFile(pkg, 'utf-8')
    .then(content => {
      return writeFile(pkg, JSON.stringify({
        ...JSON.parse(content),
        version: version.includes('-') 
          // chrome version only support at most four parts & all parts need be int
          ? [version.split('-')[0], version.split('-')[1].split('.').reduce((v, part) => {
            if (part in GREEK_MAP) return v + GREEK_MAP[part as keyof typeof GREEK_MAP]
            return v + Number.parseInt(part)
          }, 0)].join('.')
          : version
      }, undefined, 2), 'utf-8')
    })
}

// https://vite.dev/config/
export default defineConfig(async () => {
  await change(fileURLToPath(new URL('./public/manifest.json', import.meta.url)))
  return {
    build: {
      rollupOptions: {
        input: {
          main: fileURLToPath(new URL('./pages/devtools/openapi-codegen-main.html', import.meta.url)),
          panel: fileURLToPath(new URL('./pages/devtools/openapi-codegen-panel.html', import.meta.url))
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
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '#': fileURLToPath(new URL('./', import.meta.url)),
      },
    },
  }
})
