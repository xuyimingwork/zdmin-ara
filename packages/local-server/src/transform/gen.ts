import { genRequest } from '@/transform/gen-request'
import { genType } from '@/transform/gen-type'
import { GenRequestTransformer, GenRequestTransformerReturn, GenResult, OpenAPI } from '@/types'

export const DEFAULT_DATA_FILE = 'openapi.json'

/**
 * 获取代码
 */
export async function gen({ openapi, transform }: {
  openapi: OpenAPI, 
  transform: (...args: Parameters<GenRequestTransformer>) => Partial<GenRequestTransformerReturn>

}): Promise<GenResult<{ functions: number }>> {
  // 原始数据文件
  const files = [{ output: DEFAULT_DATA_FILE, content: JSON.stringify(openapi, undefined, 2) }]

  // 根类型文件
  const {
    files: fileOfTypes,  
  } = await genType({ 
    openapi 
  })

  /**
   * 函数文件
   * 函数类型定义属于？
   * 函数类型定义文件需要引用根类型文件。
   */
  const { 
    files: fileOfRequests, 
    statistic
  } = genRequest({ 
    openapi, 
    transform 
  })
  
  return {
    files: [
      ...files,
      ...fileOfTypes,
      ...fileOfRequests
    ],
    statistic
  } 
}
