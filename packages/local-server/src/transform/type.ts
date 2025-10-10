import { upperFirst } from "es-toolkit"

const TypeResponseRaw = 'Response'
const TypeRequestOptionsRaw = 'RequestOptions'
const TypeRequestBodyRaw = 'RequestBody'
const TypeRequestQueryRaw = 'RequestQuery'
const TypeRequestParamsRaw = 'RequestParams'

export const UTIL_TYPES = [
  TypeResponseRaw, 
  TypeRequestOptionsRaw,
  TypeRequestBodyRaw, 
  TypeRequestQueryRaw, 
  TypeRequestParamsRaw
] as const

export type UtilType = typeof UTIL_TYPES[number]

export const TypeRef = {
  Response: `&${TypeResponseRaw}`,
  RequestOptions: `&${TypeRequestOptionsRaw}`,
  RequestBody: `&${TypeRequestBodyRaw}`,
  RequestQuery: `&${TypeRequestQueryRaw}`,
  RequestParams: `&${TypeRequestParamsRaw}`,
}

export function getRequestTypeName(name: string, type: UtilType) {
  return upperFirst(`${name}${type}`)
}

export function replaceRefRequestType(name: string, code: string): string {
  return UTIL_TYPES.reduce((code, type) => {
    const refType = `&${type}`
    return code.replaceAll(refType, getRequestTypeName(name, type))
  }, code)
}

export function getUtilTypeName(type: UtilType) {
  return `Get${type}`
}