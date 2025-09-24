import { upperFirst } from "es-toolkit"
import { factory, SyntaxKind } from "typescript"

export const UTIL_TYPES = ['Response', 'RequestBody', 'RequestQuery'] as const
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

export function createTypeAliasDeclaration({
  name, path, method, type
}: { 
  name: string,
  path: string,
  method: string,
  type: UtilType,
}) {
  return factory.createTypeAliasDeclaration(
    [factory.createToken(SyntaxKind.ExportKeyword)],
    factory.createIdentifier(getRequestTypeName(name, type)),
    undefined,
    factory.createTypeReferenceNode(
      factory.createIdentifier(getUtilTypeName(type)),
      [
        factory.createTypeReferenceNode(factory.createIdentifier("paths"), undefined),
        factory.createLiteralTypeNode(factory.createStringLiteral(path)),
        factory.createLiteralTypeNode(factory.createStringLiteral(method))
      ]
    )
  )
}