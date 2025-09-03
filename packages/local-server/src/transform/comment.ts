import { filter, map } from 'es-toolkit/compat'
import ts from 'typescript'

export function getCommentMultiLine(text: string[] | string, { trim = false } = {}) {
  const middle = (Array.isArray(text) ? text : [text]).map(item => ` * ${item}`).join('\n')
  if (trim) return middle
  return `/**\n${middle}\n */`
}

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