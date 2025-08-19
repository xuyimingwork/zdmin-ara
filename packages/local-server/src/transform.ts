import ts from 'typescript'
import { camelCase, groupBy } from 'es-toolkit/compat'
import { kebabCase } from 'es-toolkit'
import { commentMultiLine } from '@/utils'
const factory = ts.factory

function resolve({ path, data }): { file, function, data }[] {
  const dir = path.slice(0, path.lastIndexOf('/'))
  const file = dir.split('/').length > 1 
    ? dir.slice(0, dir.lastIndexOf('/') + 1) + kebabCase(dir.slice(dir.lastIndexOf('/') + 1)) + '.ts'
    : kebabCase(dir) + '.ts'
  return Object.keys(data).map((httpMethod, i) => {
    return {
      file,
      function: camelCase(path.slice(path.lastIndexOf('/') + 1)) + (i ? i : ''),
      data: { ...data[httpMethod], _key: httpMethod },
    }
  })
}

export function transform({ openapi }) {
  function output(list: ts.NodeArray<ts.FunctionDeclaration>)  {
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const content = printer.printList(
      ts.ListFormat.MultiLine, 
      list, 
      ts.createSourceFile('', '', ts.ScriptTarget.ESNext)
    )
    return content
  }

  const files = groupBy(Object.keys(openapi.paths).map(path => {
    const data = openapi.paths[path]
    return resolve({ path, data }).map(item => ({ ...item, path }))
  }).flat(), item => item.file)

  let count = 0

  return {
    files: Object.keys(files).map(file => {
      const functions = files[file].map(item => {
        return transformOnePath({ function: item.function, path: item.path, data: item.data })
      }).flat().map(node => [node, factory.createIdentifier('\n')]).flat()
      
      count += functions.length
      const content = output(factory.createNodeArray(functions))

      return {
        file,
        content: `${commentMultiLine('@file 接口文件（由 OpenAPI CodeGen 自动生成）')}\n\n${content}`
      }
    }),
    count
  } 
}

function transformOnePath({ function: name, path, data }) {
  const withAutoComment = node => (data.summary || data.description) 
    ? ts.addSyntheticLeadingComment(
        node,
        ts.SyntaxKind.MultiLineCommentTrivia,
        `*\n${commentMultiLine([
          `@summary ${data.summary || ''}`,
          `@description ${data.description || ''}`,
        ], { onlyMiddle: true })}\n `, 
        true
      ) 
    : node
  
  return withAutoComment(factory.createFunctionDeclaration(
    [factory.createToken(ts.SyntaxKind.ExportKeyword)],
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
              factory.createStringLiteral(data._key)
            )],
            true
          )
        ]
      ))],
      true
    )
  ))
}