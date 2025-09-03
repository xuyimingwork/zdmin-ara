import ts, { createSourceFile, NewLineKind, Node, NodeArray, ScriptKind, ScriptTarget,  } from "typescript";

export function output(list: NodeArray<Node>)  {
    const printer = ts.createPrinter({ newLine: NewLineKind.LineFeed });
    const content = printer.printList(
      ts.ListFormat.MultiLine, 
      list, 
      ts.createSourceFile('', '', ScriptTarget.ESNext)
    )
    
    return unescape(content.replace(/\\u/g, "%u"));

    // const file = createSourceFile('dummy.ts',  '', ScriptTarget.ESNext, false, ScriptKind.TS)
    // // @ts-expect-error
    // file.statements = list
    // const printer = ts.createPrinter({ newLine: NewLineKind.LineFeed });
    // return printer.printFile(file);
  }