import { createSourceFile, NodeArray, ScriptTarget, Statement, SyntaxKind, TypeNode } from "typescript";

export function getAstTypeNode(code?: string): TypeNode | undefined {
  if (!code) return
  const statements = getAstStatements(`type Temp = ${code}`)
  if (!statements || !statements[0]) return
  const statement = statements[0]
  if (statement.kind !== SyntaxKind.TypeAliasDeclaration) return
  return (statement as any).type as TypeNode
}

export function getAstStatements(code?: string): NodeArray<Statement> | undefined {
  if (!code) return undefined
  const source = createSourceFile('temp.ts', code, ScriptTarget.ESNext, false)
  return source.statements
}


