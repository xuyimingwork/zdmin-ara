import { UserApiTransformer } from "@/app";
import { ImportData } from "@/types/import";
import { UserApiTransformerInput } from "@/types/option";

type ConfigItem<T = any> = T | ((input: UserApiTransformerInput) => T)
type ConfigItemFunction<T = any> = (input: UserApiTransformerInput) => T

export function createAxiosTransformer({
  module
}: {
  module?: ConfigItem<string>
  name?: ConfigItemFunction<string>
  imports?: ConfigItemFunction<ImportData[]>
}): UserApiTransformer {
  return (input) => {
    const { path, method, refs } = input
    const { 
      request, 
      imports: moduleImports, 
      types: { RequestConfig, Response } 
    } = getModuleImports(resolveConfigItem(module)(input))
    return {
      imports: [
        ...moduleImports,
      ],
      parameters: [
        {
          // align name with axios
          name: 'config', 
          // 1. 参数类型使用多个泛型
          type: `${RequestConfig}<${refs.types.RequestBody}>`,
          optional: true
        }
      ],
      types: {
        // 配置点：是否要 Response
        // 配置点：refs.types.Response 是否要获取属性
        // 例：Promise<AxiosResponse<Blob, ${refs.types.RequestBody}>>
        // 例：Promise<Get<${refs.types.Response}, 'data'>>
        return: `Promise<${Response}<${refs.types.Response}>>`
      },
      /**
       * TODO:
       * path 可能有预处理，如：含参路径处理
       * data 可能有预处理，如：FormData 处理
       * 可覆盖参数填充：...rest 前
       * 不可覆盖参数填充：直接覆盖 code？
       * .then 进行数据转换 => interceptor 中完成？
       */
      code: /* js */ `
        const { ...rest } = config || {}
        return ${request}({
          url: '${path}',
          method: '${method}',
          ...rest
        })
      `
    }
  }
}

function resolveConfigItem<T = any>(item?: ConfigItem<T>): ((input: UserApiTransformerInput) => T) {
  if (typeof item === 'function') return item as (input: UserApiTransformerInput) => T
  return (_input: UserApiTransformerInput) => item as T
}

function getModuleImports(module: string = 'axios') {
  const types = module === 'axios' 
    ? { RequestConfig: 'AxiosRequestConfig', Response: 'AxiosResponse' }
    : { RequestConfig: 'RequestConfig', Response: 'Response' }
  const typeImports = Object.values(types).map(type => ({ name: type, type: true }))
  if (module === 'axios') return {
    request: 'axios',
    types,
    imports: [
      { import: 'axios', from: 'axios' },
      { imports: typeImports, from: 'axios' },
    ]
  }
  return {
    request: 'request',
    types,
    imports: [{ 
      imports: [
        { name: 'request' },
        ...typeImports,
      ], 
      from: module 
    }]
  }
}