import { genRequest } from '@/transform/gen-request'
import { genType } from '@/transform/gen-type'
import { ApiTransformer } from '@/types/api'
import { GenResult } from '@/types/gen'
import { OpenAPI } from '@/types/openapi'

export const DEFAULT_DATA_FILE = 'openapi.json'

/**
 * 获取代码
 */
export async function gen({ openapi, transform, relocate }: {
  openapi: OpenAPI, 
  transform: ApiTransformer
  relocate?: (output: string) => string
}): Promise<GenResult<{ functions: number }>> {
  relocate = typeof relocate === 'function' ? relocate : (output: string) => output

  // 原始数据文件
  const files = [{ output: DEFAULT_DATA_FILE, content: JSON.stringify(openapi, undefined, 2) }].map(item => ({ ...item, output: relocate(item.output) }))

  // 根类型文件
  const {
    files: _fileOfTypes,  
  } = await genType({ 
    openapi
  })
  const fileOfTypes = _fileOfTypes.map(item => ({ ...item, output: relocate(item.output) }))

  const { 
    files: fileOfRequests, 
    statistic
  } = genRequest({ 
    openapi, 
    transform,
    relocate,
    rootTypes: fileOfTypes.length === 1 ? fileOfTypes[0].output : undefined
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
