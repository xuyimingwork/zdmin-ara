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
      },
      /**
       * 自定义单个 API 输出
       * 通过预设统一提供
       */
      transform({ doc, method, path, api }) {
        return {
          output: 'v3/pet.ts', // 函数输出
          name: 'getUser', // 函数名
          arguments: ['data', 'options'], // 函数入参
          request: 'request',  // 函数请求方法
          imports: [
            {
              from: '@/request/request',
              imports: {
                'request': true,
                'name': 'alias'
              },
              type: true,
            },
          ], // 函数导入方法
          // request 入参如何传递
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
