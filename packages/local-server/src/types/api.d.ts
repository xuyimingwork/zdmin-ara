import type { ImportData } from "@/types/import"
import type { OpenAPIPathOperationObject } from "@/types/openapi"

export interface ApiBaseData {
  // http 方法
  method: string, 
  // http 路径
  path: string, 
  // openapi 数据（函数层级）
  openapi: OpenAPIPathOperationObject,
}

export interface ApiTransformer {
  (options: ApiBaseData & {
    // 默认值
    base: ReturnType<ApiTransformer>
  }): {
    /* 忽略该函数 */
    ignore?: boolean
    /* 函数输出文件路径 */
    output?: string
    /* 函数名 */
    name?: string
    /* 函数体（代码块） */
    code?: string
    /* 函数入参 */
    arguments?: Array<string | {
      name: string
      /* 配置可选参数 */
      optional?: boolean
      /* 配置剩余参数 */
      rest?: boolean
      /* 配置参数类型 */
      type?: string
    }>
    /* 函数依赖 */
    imports?: ImportData[]
    /* 类型声明 */
    types?: { 
      return?: string 
    }
  }
}