import { getAstStatements, getAstTypeNode } from "@/transform/ast/code";
import { ApiBaseData, ApiTransformer } from "@/types/api";
import type { FunctionDeclaration, JSDoc, JSDocTag, Node, ParameterDeclaration } from "typescript";
import ts from "typescript";
const factory = ts.factory
const SyntaxKind = ts.SyntaxKind
type FunctionContext = ApiBaseData & { output: string }

function createParameterDeclaration(parameters: ReturnType<ApiTransformer>['parameters'], js = false): ParameterDeclaration[] {
  if (!Array.isArray(parameters)) return []
  function inTs(...args: (boolean | undefined)[]) {
    if (!args.length) return !js
    return args.every(condition => !!condition) && !js
  }
  return parameters.map(parameter => {
    parameter = typeof parameter === 'string' ? { name: parameter } : parameter
    return factory.createParameterDeclaration(
      undefined,
      parameter.rest ? factory.createToken(SyntaxKind.DotDotDotToken) : undefined,
      factory.createIdentifier(parameter.name),
      inTs(parameter.optional) ? factory.createToken(SyntaxKind.QuestionToken) : undefined,
      inTs() ? getAstTypeNode(parameter.type) : undefined,
      undefined
    )
  })
}

export function createFunctionDeclaration({
  name, 
  code,
  parameters,
  context,
  types,
  debug
}: { 
  name: string
  code: string,
  parameters: ReturnType<ApiTransformer>['parameters']
  context: FunctionContext
  types: { return?: string }
  debug: boolean
}): (JSDoc | FunctionDeclaration)[] {
  const isTs = context.output.endsWith('.ts')
  return [
    createFunctionJSDocComment({ 
      ...types,
      parameters, 
    }, context, debug),
    factory.createFunctionDeclaration(
      [factory.createToken(SyntaxKind.ExportKeyword)],
      undefined,
      factory.createIdentifier(name),
      undefined,
      createParameterDeclaration(parameters, !isTs),
      isTs ? getAstTypeNode(types?.return) : undefined,
      factory.createBlock(getAstStatements(code, isTs ? 'ts' : 'js') || [], true)
    )
  ].filter(item => !!item)
}

function createFunctionJSDocComment(types: { 
  parameters?: ReturnType<ApiTransformer>['parameters'],
  return?: string
}, context: FunctionContext, debug: boolean): JSDoc | undefined {
  const openapi = context.openapi
  const isJs = context.output.endsWith('.js')
  const typeTags: JSDocTag[] = isJs ? [
    ...(types.parameters || []).filter(item => typeof item !== 'string' && !!item.type).map(parameter => {
      if (typeof parameter === 'string') return
      return factory.createJSDocParameterTag(
        undefined, 
        factory.createIdentifier(parameter.name), 
        !!parameter.optional, 
        getAstTypeNode(parameter.type) ? factory.createJSDocTypeExpression(getAstTypeNode(parameter.type)!) : undefined, 
        false
      )
    }),
    getAstTypeNode(types?.return) ? factory.createJSDocReturnTag(undefined, factory.createJSDocTypeExpression(getAstTypeNode(types?.return)!)) : undefined,
  ].filter(item => !!item) : []
  const tags: JSDocTag[] = [
    (openapi as any).deprecated ? factory.createJSDocDeprecatedTag(undefined) : undefined,
    openapi.summary ? factory.createJSDocUnknownTag(factory.createIdentifier('summary'), openapi.summary) : undefined,
    openapi.description ? factory.createJSDocUnknownTag(factory.createIdentifier('description'), openapi.description) : undefined,
    ...typeTags,
    debug ? factory.createJSDocUnknownTag(factory.createIdentifier('see'), `debug\n ${context.method} ${context.path}\n ${JSON.stringify(openapi, undefined, 2)}`) : undefined
  ].filter(item => !!item)
  return tags.length ? factory.createJSDocComment(undefined, tags) : undefined
}