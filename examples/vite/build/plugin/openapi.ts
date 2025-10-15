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
        // another example
        apple: 'https://apis.guru/apis/apple.com/app-store-connect'
      },
      transform: createTransformBuilder({ 
        // base transform for config basic import & response & arguments first
        baseTransformer: ({ refs }) => ({
          imports: [
            // import axios & axios's type
            { from: 'axios', import: 'axios' },
            { from: 'type-fest', imports: [{ name: 'Merge', type: true }] },
            { from: 'axios', imports: [{ name: 'AxiosResponse', type: true }, { name: 'AxiosRequestConfig', type: true }] }
          ],
          parameters: [
            { 
              name: 'options',
              // use axios request config's data as body
              type: `Merge<AxiosRequestConfig<${refs.types.RequestBody}>, Omit<${refs.types.RequestOptions}, 'body'>>`,
              optional: true
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
              // all pet-v* api will generate under v*/ dir
              output: `${doc.name.replace('pet-', '')}/${base.output}`  
            }) 
          })
          // config different baseURL for different docs
          .when({ doc: 'pet-v2' }, ({ path, method, base }) => ({ 
            output: base.output.replace(/.ts$/, '.js'),
            code: codeFactory({ path, method, baseURL: `'https://petstore.swagger.io/v2'` }) 
          }))
          .when({ doc: 'pet-v3' }, ({ path, method }) => ({ 
            code: codeFactory({ path, method, baseURL: `'https://petstore3.swagger.io/api/v3/'` }) 
          }))
          // since use build, if there is pet-v4 doc, all api in pet-v4 will be ignored
          // if you want pet-v4 will generate by transformer above, use default to build transformer
          .build() 
        )
        // all other doc will use this transform
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