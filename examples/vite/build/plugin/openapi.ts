import Ara from '@zdmin/ara-unplugin/vite'
import { basename } from 'node:path'
import { camelCase } from 'es-toolkit'

import { createTransformBuilder, normalizeApiPath } from '@zdmin/ara-unplugin'
import type { UserApiTransformer } from '@zdmin/ara-unplugin'

const myAxiosTransformer: UserApiTransformer = function ({
  method, path, refs
}) {
  function codeFactory({ baseURL = '' } = {}) {
    return `
      const { params, query, ...rest } = options || {}
      return axios({
        ${baseURL ? `baseURL: ${baseURL}` : ''}
        method: "${method}",
        url: ${normalizeApiPath(path, 'params')},
        params: query,
        ...rest
      }) as any
    `
  }
  return {
    imports: [
      { from: 'axios', import: 'axios' },
      { from: 'axios', imports: [{ name: 'AxiosResponse', type: true }, { name: 'AxiosRequestConfig', type: true }] }
    ],
    arguments: [
      { 
        name: 'options',
        type: `Omit<${refs.types.RequestOptions}, 'body'> & AxiosRequestConfig<${refs.types.RequestBody}>`,
        optional: true,
      }
    ],
    codeFactory,
    code: codeFactory(),
    types: {
      return: `Promise<AxiosResponse<${refs.types.Response}, ${refs.types.RequestBody}>>`,
    }
  } 
}

export function OpenAPI() {
  return Ara({
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
        .when({ doc: /^pet-/ }, 
          createTransformBuilder({ 
            baseTransformer: ({ doc, base }) => ({
              // 演示：多份文档同一输出位置，调整 api 输出位置
              output: `${doc.name.replace('pet-', '')}/${base.output}`  
            }) 
          })
            .when({ doc: 'pet-v2' }, ({ base }) => ({ code: (base.codeFactory as any)({ baseURL: `'https://petstore.swagger.io/v2'` }) }))
            .when({ doc: 'pet-v3' }, ({ base }) => ({ code: (base.codeFactory as any)({ baseURL: `'https://petstore.swagger.io/v2'` }) }))
            .build()   
        )
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
}