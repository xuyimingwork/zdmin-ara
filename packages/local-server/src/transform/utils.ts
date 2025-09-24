import { OpenAPI, OpenAPI2, OpenAPI3 } from "@/types"
import { dirname, relative } from "path"

export function commentMultiLine(text: string[] | string, { onlyMiddle = false } = {}) {
  const middle = (Array.isArray(text) ? text : [text]).map(item => ` * ${item}`).join('\n')
  if (onlyMiddle) return middle
  return `/**\n${middle}\n */`
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