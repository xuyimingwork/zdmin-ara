import ts, { factory, ScriptKind } from "typescript";
import type { NodeArray, Statement, TypeNode, Visitor } from "typescript";

const ScriptTarget = ts.ScriptTarget
const SyntaxKind = ts.SyntaxKind
const createSourceFile = ts.createSourceFile

export function getAstTypeNode(code?: string): TypeNode | undefined {
  if (!code) return
  const statements = getAstStatements(`type Temp = ${code}`)
  if (!statements || !statements[0]) return
  const statement = statements[0]
  if (statement.kind !== SyntaxKind.TypeAliasDeclaration) return
  return (statement as any).type as TypeNode
}

export function getAstStatements(code?: string, target: 'ts' | 'js' = 'ts'): NodeArray<Statement> | undefined {
  if (!code) return undefined
  if (target === 'js') code = ts.transpile(code, { target: ScriptTarget.ESNext })
  const source = createSourceFile('temp.ts', code, ScriptTarget.ESNext, false)
  return source.statements
}


