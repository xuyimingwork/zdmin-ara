import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import OpenAPI from '@zdmin/ara-unplugin/vite'
import { basename } from 'node:path'
import { camelCase } from 'es-toolkit'

import { createTransformBuilder } from '@zdmin/ara-unplugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    OpenAPI({
      doc: {
        ['pet-v2']: {
          url: 'https://petstore.swagger.io/',
          outDir: 'pet'
        },
        ['pet-v3']: {
          url: 'https://petstore3.swagger.io/',
          outDir: 'pet'
        },
        ['gpx-document']: 'https://192.168.8.186/gateway/gpx-document/doc.html#/home',
        ['ruoyi']: 'http://192.168.8.186:8080/gpx-ruoyi-flex/swagger-ui/index.html?urls.primaryName=6.%E8%84%9A%E6%9C%AC%E7%94%9F%E6%88%90%E6%A8%A1%E5%9D%97#/'
      },
      transform: createTransformBuilder({ baseTransformer: myAxiosTransformer })
        .when({ doc: /^pet-/ }, ({ doc, base }) => ({
          // 演示：多份文档同一输出位置，调整 api 输出位置
          output: `${doc.name.replace('pet-', '')}/${base.output}`  
        }))
        .when({ doc: /^gpx-/ }, createTransformBuilder()
          .when({ doc: 'gpx-document' }, ({ base }) => ({
            output: base.output.substring('gpx-document/'.length)
          }))
          .default(({ path }) => ({
            name: camelCase(basename(path))
          }))
        )
        .default(() => ({}))
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})

function myAxiosTransformer({
  method, path
}) {
  return {
    imports: [
      { from: 'axios', import: 'axios' },
      { from: 'axios', imports: [{ name: 'AxiosResponse', type: true }, { name: 'AxiosRequestConfig', type: true }] }
    ],
    arguments: [
      method === 'get' ? {
        name: 'params',
        type: '&RequestQuery'
      } : {
        name: 'data',
        type: '&RequestBody'
      }, 
      { 
        name: 'options',
        optional: true,
        type: 'AxiosRequestConfig<&RequestBody>'
      }
    ],
    code: `
      return axios({
        method: "${method}",
        url: "${path}",
        ${method === 'get' ? 'params' : 'data'},
        ...options
      }) as any
    `,
    types: {
      return: 'Promise<AxiosResponse<&Response, &RequestBody>>',
    }
  } 
}
