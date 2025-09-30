import { getAstStatements, getAstTypeNode } from "@/transform/ast/code";
import { createJSDocFunctionLeadingComment } from "@/transform/ast/comment";
import { ApiBaseData, ApiTransformer } from "@/types/api";
import type { Node, ParameterDeclaration } from "typescript";
import ts from "typescript";
const factory = ts.factory
const SyntaxKind = ts.SyntaxKind

function patchLeadingComment(node: Node, context: ApiBaseData, debug: boolean) {
  const openapi = context.openapi
  if (!openapi.summary && !openapi.description && !debug) return node
  return createJSDocFunctionLeadingComment(node, [
    { key: 'summary', value: openapi.summary! },
    { key: 'description', value: openapi.description! },
    debug ? { key: 'see', value: `debug
  ${context.method} ${context.path}
  ${JSON.stringify(openapi, undefined, 2)}` } : undefined
  ].filter(item => !!item))
}

function createParameterDeclaration(parameters: ReturnType<ApiTransformer>['arguments']): ParameterDeclaration[] {
  if (!Array.isArray(parameters)) return []
  return parameters.map(parameter => {
    parameter = typeof parameter === 'string' ? { name: parameter } : parameter
    return factory.createParameterDeclaration(
      undefined,
      parameter.rest ? factory.createToken(SyntaxKind.DotDotDotToken) : undefined,
      factory.createIdentifier(parameter.name),
      parameter.optional ? factory.createToken(SyntaxKind.QuestionToken) : undefined,
      getAstTypeNode(parameter.type),
      undefined
    )
  })
}

export function createFunctionDeclaration({
  name, 
  code,
  arguments: parameters,
  context,
  types,
  debug
}: { 
  name: string
  code: string,
  arguments: ReturnType<ApiTransformer>['arguments']
  context: ApiBaseData
  types: { return?: string }
  debug: boolean
}): Node {
  return patchLeadingComment(
    factory.createFunctionDeclaration(
      [factory.createToken(SyntaxKind.ExportKeyword)],
      undefined,
      factory.createIdentifier(name),
      undefined,
      createParameterDeclaration(parameters),
      getAstTypeNode(types?.return),
      factory.createBlock(getAstStatements(code) || [], true)
    ),
    context,
    debug
  )
}