import { OpenAPI, OpenAPI2, OpenAPI3 } from "@/types/openapi"
import { dirname, relative } from "path"

export function getCommentMultiLine(text: string[] | string, { trim = false } = {}) {
  const middle = (Array.isArray(text) ? text : [text]).map(item => ` * ${item}`).join('\n')
  if (trim) return middle
  return `/**\n${middle}\n */`
}

export function patchBanner(content: string): string {
  return `${getCommentMultiLine([
    '本文件由 OpenAPI CodeGen 自动生成，请不要直接修改'
  ])}\n\n${content}`
}

export function isOpenAPI2(openapi: OpenAPI): openapi is OpenAPI2 {
  return !!(openapi as OpenAPI2).swagger
}

 export function isOpenAPI3(openapi: OpenAPI): openapi is OpenAPI3 {
  return !!(openapi as OpenAPI3).openapi
}

export function getImportRelative(current: string, target: string) {
  const raw = relative(dirname(current), target)
  return raw.startsWith('../') ? raw : `./${raw}`
}