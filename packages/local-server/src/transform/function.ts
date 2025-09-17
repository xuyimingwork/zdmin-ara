import { createJSDocFunctionLeadingComment } from "@/transform/comment";
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
  path, 
  method,
  context
}): Node {
  return patchLeadingComment(
    factory.createFunctionDeclaration(
      [factory.createToken(SyntaxKind.ExportKeyword)],
      undefined,
      factory.createIdentifier(name),
      undefined,
      [],
      undefined,
      factory.createBlock(
        [factory.createReturnStatement(factory.createCallExpression(
          factory.createIdentifier("fetch"),
          undefined,
          [
            factory.createStringLiteral(path),
            factory.createObjectLiteralExpression(
              [factory.createPropertyAssignment(
                factory.createIdentifier("method"),
                factory.createStringLiteral(method)
              )],
              true
            )
          ]
        ))],
        true
      )
    ),
    context
  )
}