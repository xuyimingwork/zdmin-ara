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

export function getRequestTypeInUse(name: string, code: string): string[] {
  return UTIL_TYPES.filter(type => {
    const refType = `&${type}`
    const typeName = getRequestTypeName(name, type)
    return code.includes(refType) || code.includes(typeName)
  }).map(type => getRequestTypeName(name, type))
}

export function getRequestTypeInUseFromCodes(name: string, codes: string[]): string[] {
  return codes.map(code => getRequestTypeInUse(name, code)).flat()
}

export function hasRequestTypeInUse(name: string, code: string): boolean {
  return getRequestTypeInUse(name, code).length > 0
}

export function normalizeRequestType(name: string, code: string, noRequestType?: boolean): string {
  if (!hasRequestTypeInUse(name, code)) return code
  return UTIL_TYPES.reduce((code, type) => {
    const refType = `&${type}`
    const typeName = getRequestTypeName(name, type)
    const codeWithRequestType = code.replaceAll(refType, typeName)
    return noRequestType ? codeWithRequestType.replaceAll(typeName, 'any') : codeWithRequestType
  }, code)
}

export function getUtilTypeName(type: UtilType) {
  return `Get${type}`
}