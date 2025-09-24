import { upperFirst } from "es-toolkit"

export const UTIL_TYPES = ['Response', 'RequestBody', 'RequestQuery', 'RequestParams'] as const
export type UtilType = typeof UTIL_TYPES[number]

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