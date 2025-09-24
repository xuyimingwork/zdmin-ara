import { getAstStatements, getAstTypeNode } from "@/transform/ast/code";
import { createJSDocFunctionLeadingComment } from "@/transform/ast/comment";
import { OpenAPIPathOperationObject } from "@/types/openapi";
import { Node, factory, SyntaxKind } from "typescript";

function patchLeadingComment(node: Node, context: any) {
  return (context.summary || context.description) 
    ? createJSDocFunctionLeadingComment(node, [
      { key: 'summary', value: context.summary },
      { key: 'description', value: context.description },
    ])
    : node
}

export function createFunctionDeclaration({
  name, 
  code,
  arguments: parameters,
  openapi,
  types
}: { 
  name: string
  code: string,
  arguments: string[]
  openapi: OpenAPIPathOperationObject 
  types: { return?: string }
}): Node {
  return patchLeadingComment(
    factory.createFunctionDeclaration(
      [factory.createToken(SyntaxKind.ExportKeyword)],
      undefined,
      factory.createIdentifier(name),
      undefined,
      Array.isArray(parameters) 
        ? parameters.map(key => factory.createParameterDeclaration(
          undefined,
          undefined,
          factory.createIdentifier(key),
          undefined,
          undefined,
          undefined
        ))
        : [],
      getAstTypeNode(types?.return),
      factory.createBlock(getAstStatements(code) || [], true)
    ),
    openapi
  )
}