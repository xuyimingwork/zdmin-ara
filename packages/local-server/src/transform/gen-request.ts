import { patchBanner } from "@/transform/banner"
import { createFunctionDeclaration } from "@/transform/function"
import { genImports, normalizeImports } from "@/transform/gen-imports"
import { output } from "@/transform/printer"
import { AstInputFile, AstInputImportNormalized, AstInputRequest, GenRequestTransformer, GenRequestTransformerOptions, GenRequestTransformerReturn, GenResult, OpenAPI, OpenAPIPathOperationObject, GenFile } from "@/types"
import { camelCase, groupBy, kebabCase, upperFirst } from "es-toolkit"
import { each } from "es-toolkit/compat"
import { basename, dirname, normalize, relative } from "path"
import ts from 'typescript'

const factory = ts.factory

type ForEachRequestCallback = (request: Omit<GenRequestTransformerOptions, 'base'>) => void

function forEachRequest(openapi: OpenAPI, cb: ForEachRequestCallback) {
  each(Object.keys(openapi.paths || {}).map(path => {
    const item = openapi.paths?.[path] || {}
    each(Object.keys(item), method => {
      cb({ path, method, openapi: item[method] })
    })
  }))
}

type MapEachRequestCallback<T = void> = (...p: Parameters<ForEachRequestCallback>) => T

function mapEachRequest<T = void>(openapi: OpenAPI, cb: MapEachRequestCallback<T>): Array<T> {
  const result: T[] = []
  forEachRequest(openapi, (...args) => {
    const item = cb(...args)
    result.push(item)
  })
  return result
}

type PresetApiTransformer = (options: Omit<GenRequestTransformerOptions, 'base'>) => Required<GenRequestTransformerReturn>

const baseTransformer: PresetApiTransformer = ({ path, method }) => {
  const base = basename(path)
  const dir = dirname(path).startsWith('/')
    ? dirname(path).substring(1)
    : dirname(path)
  const output = normalize(dir || 'index').split('/').map(item => kebabCase(item)).join('/') + '.ts'
  return {
    output: output.startsWith('/') ? output.substring(1) : output,
    name: camelCase(`${method}+${base}`),
    code: '',
    arguments: [],
    imports: []
  }
}

function genFileOfRequestTypes({ rootTypes, pairOutput, requests }: {
  rootTypes?: string
  pairOutput: string
  requests?: AstInputFile['requests']
}): GenFile | void {
  if (!rootTypes) return
  const relativeToRootTypes = relative(dirname(pairOutput), rootTypes) === basename(rootTypes)
    ? `./${relative(dirname(pairOutput), rootTypes)}`
    : relative(dirname(pairOutput), rootTypes)
  return {
    output: pairOutput.replace(/\.ts$/, '.d.ts'),
    content: patchBanner(output(factory.createNodeArray([
      ...genImports([
        {
          mode: 'type',
          from: '@zdmin/ara-unplugin',
          imports: [
            { name: 'GetResponse' },
            { name: 'GetRequestQuery' },
            { name: 'GetRequestBody' }
          ]
        },
        {
          mode: 'type',
          from: relativeToRootTypes,
          imports: [{ name: 'paths' }]
        }
      ]),
      factory.createIdentifier('\n'),
      ...Array.isArray(requests) ? requests.map(request => {
        return [
          factory.createTypeAliasDeclaration(
            [factory.createToken(ts.SyntaxKind.ExportKeyword)],
            factory.createIdentifier(upperFirst(`${request.name}Response`)),
            undefined,
            factory.createTypeReferenceNode(
              factory.createIdentifier("GetResponse"),
              [
                factory.createTypeReferenceNode(factory.createIdentifier("paths"), undefined),
                factory.createLiteralTypeNode(factory.createStringLiteral(request.path)),
                factory.createLiteralTypeNode(factory.createStringLiteral(request.method))
              ]
            )
          ),
          factory.createTypeAliasDeclaration(
            [factory.createToken(ts.SyntaxKind.ExportKeyword)],
            factory.createIdentifier(upperFirst(`${request.name}RequestQuery`)),
            undefined,
            factory.createTypeReferenceNode(
              factory.createIdentifier("GetRequestQuery"),
              [
                factory.createTypeReferenceNode(factory.createIdentifier("paths"), undefined),
                factory.createLiteralTypeNode(factory.createStringLiteral(request.path)),
                factory.createLiteralTypeNode(factory.createStringLiteral(request.method))
              ]
            )
          ),
          factory.createTypeAliasDeclaration(
            [factory.createToken(ts.SyntaxKind.ExportKeyword)],
            factory.createIdentifier(upperFirst(`${request.name}RequestBody`)),
            undefined,
            factory.createTypeReferenceNode(
              factory.createIdentifier("GetRequestBody"),
              [
                factory.createTypeReferenceNode(factory.createIdentifier("paths"), undefined),
                factory.createLiteralTypeNode(factory.createStringLiteral(request.path)),
                factory.createLiteralTypeNode(factory.createStringLiteral(request.method))
              ]
            )
          ),
          factory.createIdentifier('\n')
        ]
      }).flat() : []
    ])))
  }
}

function genFileOfRequests() {


}

export function genRequest({ openapi, transform, relocate, rootTypes }: {
  openapi: OpenAPI,
  transform: (...args: Parameters<GenRequestTransformer>) => Partial<GenRequestTransformerReturn>
  relocate?: (output: string) => string
  rootTypes?: string
}): GenResult<{ functions: number }> {

  // 先生成类型文件，request 的 import 需要依赖类型文件

  // 所有请求
  const requests = mapEachRequest<AstInputRequest>(openapi, ({ method, path, openapi }) => {
    const baseConfig = baseTransformer({ method, path, openapi })
    const config = transform({ method, path, openapi, base: baseConfig })
    const result = Object.assign({ openapi, method, path }, baseConfig, config)
    return {
      ...result,
      output: typeof relocate === 'function' ? relocate(result.output) : result.output
    }
  })

  // 所有请求构成的文件
  const rawFiles: AstInputFile[] = Object.keys(groupBy(requests, item => item.output))
    .map(output => {
      const fileRequests = requests.filter(item => item.output === output)
      const imports = normalizeImports(fileRequests.map(item => Array.isArray(item.imports) ? item.imports : []).flat())
      return {
        output,
        imports,
        requests: fileRequests.map(({ imports: _, ...item }) => item)
      }
    })


  const files = rawFiles.map(item => {
    const file = genFileOfRequestTypes({ rootTypes, pairOutput: item.output, requests: item.requests })

    const imports = genImports(item.imports as AstInputImportNormalized[])
    const functions = Array.isArray(item.requests) ? item.requests.map(request => {
      return [
        createFunctionDeclaration({
          name: request.name,
          openapi: request.openapi,
          code: request.code,
          arguments: request.arguments || []
        }),
        factory.createIdentifier('\n')
      ]
    }).flat() : []
    const content = output(factory.createNodeArray([
      ...imports,
      ...(imports.length ? [factory.createIdentifier('\n')] : []),
      ...functions
    ]))
    return file ? [
      file, {
        output: item.output,
        content: patchBanner(content)
      }] : [
      {
        output: item.output,
        content: patchBanner(content)
      }
    ]
  }).flat()

  return { files, statistic: { functions: requests.length } }
}