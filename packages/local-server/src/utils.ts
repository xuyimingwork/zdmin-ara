export function commentMultiLine(text: string[] | string, { onlyMiddle = false } = {}) {
  const middle = (Array.isArray(text) ? text : [text]).map(item => ` * ${item}`).join('\n')
  if (onlyMiddle) return middle
  return `/**\n${middle}\n */`
}