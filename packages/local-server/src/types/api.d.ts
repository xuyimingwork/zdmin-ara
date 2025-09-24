import { OpenAPIPathOperationObject } from "@/types/openapi"

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
    /* 函数输出文件路径 */
    output?: string
    /* 函数名 */
    name?: string
    /* 函数体（代码块） */
    code?: string
    /* 函数入参 */
    arguments?: string[]
    /* 函数依赖 */
    imports?: ApiImport[]
    /* 类型声明 */
    types?: { 
      return?: string 
    }
  }
}