import { getRequestTypeName, getUtilTypeName, UtilType } from "@/transform/type"
import { factory, SyntaxKind } from "typescript"

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