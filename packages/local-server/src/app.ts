import connect from 'connect';
import { createServer } from 'http';
import cors from 'cors'
import bodyParser from 'body-parser'
import ConnectRest from 'connect-rest';
import { writeFile } from 'fs/promises';
import ts from 'typescript'
import { camelCase } from 'es-toolkit/compat'
const factory = ts.factory

const app = connect();

app.use( bodyParser.urlencoded( { extended: true } ) )
app.use( bodyParser.json() )
app.use(cors())

const rest = ConnectRest.create({
  context: '/openapi-codegen',
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any

/**
 * 后端服务接口需要仔细设计
 * - 1 个服务可以对应 n 个项目（项目可以用本地路径区分）
 * - 1 个项目可以对应 n 个 OpenAPI 文档（使用文档路径？）
 */
rest.post('/files', (request, content) => {
  if (!Array.isArray(content)) return Promise.reject(new Error('Invalid content type, expected an array of files.'));
  console.log('Received files:', content);
  return Promise.all(content.map(({ content }, i) => {
    if (typeof content !== 'string') {
      return Promise.reject(new Error('Invalid file content, expected a string.'));
    }
    
    return writeFile(`./${Date.now()}-${i}.json`, content, 'utf8')
  })).then(res => ({ ok: true }))
})

rest.post('/openapi', (request, content) => {
  if (!content?.data) return Promise.reject(new Error('Invalid content'));
  return Promise.all([
    ...transform({ openapi: content.data }), 
    { file: 'openapi.json', content: JSON.stringify(content.data, undefined, 2) }
  ].map(({ file, content }) => {
    return writeFile(`./temp/${file}`, content, 'utf8')
  })).then(res => ({ ok: true }))
})

app.use(rest.processRequest());

createServer(app).listen(9125)

export function transform({ openapi }) {
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const content = printer.printList(ts.ListFormat.MultiLine, factory.createNodeArray([
    ...Object.keys(openapi.paths).map(path => {
      return transformOnePath({ path, data: openapi.paths[path] })
    }).flat()
  ]), ts.createSourceFile('', '', ts.ScriptTarget.ESNext))

  return [{
    file: 'api.ts',
    content: `// 本文件由 OpenAPI CodeGen 自动生成\n\n${content}`
  }]
}

function transformOnePath({ path, data }) {
  return Object.keys(data).map((method, i) => {
    return factory.createFunctionDeclaration(
      [factory.createToken(ts.SyntaxKind.ExportKeyword)],
      undefined,
      factory.createIdentifier(`${camelCase(path)}${i ? i : ''}`),
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
    )
  })
}

