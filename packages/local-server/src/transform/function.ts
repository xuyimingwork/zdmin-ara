import { createJSDocFunctionLeadingComment } from "@/transform/comment";
import { OpenAPIPathOperationObject } from "@/types";
import { Node, factory, SyntaxKind, createSourceFile, ScriptTarget } from "typescript";

function patchLeadingComment(node: Node, context: any) {
  return (context.summary || context.description) 
    ? createJSDocFunctionLeadingComment(node, [
      { key: 'summary', value: context.summary },
      { key: 'description', value: context.description },
    ])
    : node
}

// factory.createParameterDeclaration()

export function createFunctionDeclaration({
  name, 
  code,
  arguments: parameters,
  openapi
}: { 
  name: string
  code: string,
  arguments: string[]
  openapi: OpenAPIPathOperationObject 
}): Node {
  const block = createSourceFile('temp.ts', code, ScriptTarget.ESNext, false)
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
      undefined,
      factory.createBlock(block.statements, true)
    ),
    openapi
  )
}