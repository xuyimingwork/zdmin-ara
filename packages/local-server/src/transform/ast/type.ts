import { getRequestTypeName, getUtilTypeName, UtilType } from "@/transform/type"
import ts from "typescript"

const factory = ts.factory
const SyntaxKind = ts.SyntaxKind

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