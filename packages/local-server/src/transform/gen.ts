import { genRequest } from '@/transform/gen-request'
import { genType } from '@/transform/gen-type'
import { GenRequestTransformer, GenRequestTransformerReturn, GenResult, OpenAPI } from '@/types'

export async function gen({ openapi, transform }: {
  openapi: OpenAPI, 
  transform: (...args: Parameters<GenRequestTransformer>) => Partial<GenRequestTransformerReturn>
}): Promise<GenResult<{ functions: number }>> {
  const {
    files: fileOfTypes,  
  } = await genType({ openapi })

  const { 
    files: fileOfRequests, 
    statistic
  } = genRequest({ openapi, transform })
  
  return {
    files: [
      ...fileOfTypes,
      ...fileOfRequests
    ],
    statistic
  } 
}
