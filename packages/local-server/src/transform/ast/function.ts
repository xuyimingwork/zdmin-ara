import { getAstStatements, getAstTypeNode } from "@/transform/ast/code";
import { createJSDocFunctionLeadingComment } from "@/transform/ast/comment";
import { ApiTransformer } from "@/types/api";
import { OpenAPIPathOperationObject } from "@/types/openapi";
import type { Node, ParameterDeclaration } from "typescript";
import ts from "typescript";
const factory = ts.factory
const SyntaxKind = ts.SyntaxKind

function patchLeadingComment(node: Node, context: any) {
  return (context.summary || context.description) 
    ? createJSDocFunctionLeadingComment(node, [
      { key: 'summary', value: context.summary },
      { key: 'description', value: context.description },
    ])
    : node
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
  openapi,
  types
}: { 
  name: string
  code: string,
  arguments: ReturnType<ApiTransformer>['arguments']
  openapi: OpenAPIPathOperationObject 
  types: { return?: string }
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
    openapi
  )
}