import { getCommentMultiLine } from '@/transform/utils'
import { filter, map } from 'es-toolkit/compat'
import ts from 'typescript'

export function createJSDocFunctionLeadingComment<T extends ts.Node>(node: T, items: Array<{ key: string, value: string }>): T {
  items = filter(items, item => item && item.key) as any
  if (!items.length) return node
  return ts.addSyntheticLeadingComment(
    node,
    ts.SyntaxKind.MultiLineCommentTrivia,
    `*\n${getCommentMultiLine(map(items, item => `@${item.key} ${item.value || ''}`), { trim: true })}\n `, 
    true
  )
}