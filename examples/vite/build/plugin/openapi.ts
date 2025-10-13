import Ara from '@zdmin/ara-unplugin/vite'
import { createTransformBuilder, normalizeApiPath } from '@zdmin/ara-unplugin'

export function OpenAPI() {
  return Ara({
      // multiple docs in same project
      doc: {
        // pet-v* will generate in same dir
        'pet-v2': {
          url: 'https://petstore.swagger.io/',
          outDir: 'pet'
        },
        'pet-v3': {
          url: 'https://petstore3.swagger.io/',
          outDir: 'pet'
        },
        apple: 'https://apis.guru/apis/apple.com/app-store-connect'
      },
      transform: createTransformBuilder({ 
        // base transform for config basic import & response & arguments
        baseTransformer: ({ refs }) => ({
          imports: [
            // import axios & axios's type
            { from: 'axios', import: 'axios' },
            { from: 'axios', imports: [{ name: 'AxiosResponse', type: true }, { name: 'AxiosRequestConfig', type: true }] }
          ],
          arguments: [
            { 
              name: 'options',
              // use axios request config's data as body
              type: `Omit<${refs.types.RequestOptions}, 'body'> & AxiosRequestConfig<${refs.types.RequestBody}>`,
              optional: true,
            }
          ],
          types: {
            // integration with axios's response
            return: `Promise<AxiosResponse<${refs.types.Response}, ${refs.types.RequestBody}>>`,
          }
        }) 
      })
        // doc name start with pet- will handled by this transformer
        .when({ doc: /^pet-/ }, createTransformBuilder({ 
            // base transform only for doc name starts pet-
            baseTransformer: ({ doc, base }) => ({
              // add version dir when output apis
              // all pet-v2 api will generate under v2/*
              output: `${doc.name.replace('pet-', '')}/${base.output}`  
            }) 
          })
          // use myAxiosTransformer.codeFactory
          .when({ doc: 'pet-v2' }, ({ path, method }) => ({ code: codeFactory({ path, method, baseURL: `'https://petstore.swagger.io/v2'` }) }))
          .when({ doc: 'pet-v3' }, ({ path, method }) => ({ code: codeFactory({ path, method, baseURL: `'https://petstore.swagger.io/v2'` }) }))
          .build()   
        )
        .default(({ path, method }) => ({ code: codeFactory({ path, method }) }))
    })
}

function codeFactory({ 
  path = '',
  method = 'get', 
  baseURL = '' 
} = {}) {
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