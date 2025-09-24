import ts, { NewLineKind, Node, NodeArray, ScriptTarget,  } from "typescript";

export function output(list: NodeArray<Node>): string  {
  const printer = ts.createPrinter({ newLine: NewLineKind.LineFeed });
  const content = printer.printList(
    ts.ListFormat.MultiLine, 
    list, 
    ts.createSourceFile('', '', ScriptTarget.ESNext)
  )
  
  // ts bug: https://github.com/microsoft/TypeScript/issues/36174#issuecomment-597564149
  // ts 不具备调整缩进的能力，不处理/第三方库再处理
  return unescape(content.replace(/\\u/g, "%u"));
}