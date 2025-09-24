import { createFunctionDeclaration } from "@/transform/ast/function"
import { genImports, normalizeImports } from "@/transform/gen-imports"
import { output } from "@/transform/printer"
import { getRequestTypeName, getUtilTypeName, replaceRefRequestType, UTIL_TYPES } from "@/transform/type"
import { getImportRelative, patchBanner } from "@/transform/utils"
import { AstInputFile, AstInputImportNormalized, AstInputRequest, GenRequestTransformer, GenRequestTransformerOptions, GenRequestTransformerReturn, GenResult, OpenAPI, OpenAPIPathOperationObject, GenFile } from "@/types"
import { camelCase, groupBy, kebabCase, mapValues } from "es-toolkit"
import { each } from "es-toolkit/compat"
import { basename, dirname, normalize } from "path"
import ts from 'typescript'
import { createTypeAliasDeclaration } from "@/transform/ast/type"

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
    imports: [],
    types: {}
  }
}

function genFileOfRequestTypes({ rootTypes, pairOutput, requests }: {
  rootTypes?: string
  pairOutput: string
  requests?: AstInputFile['requests']
}): (GenFile & { types: string[] }) | undefined {
  if (!rootTypes) return
  return {
    output: pairOutput.replace(/\.ts$/, '.d.ts'),
    types: Array.isArray(requests) 
      ? requests.map(request => UTIL_TYPES.map(name => getRequestTypeName(request.name, name))).flat()
      : [],
    content: patchBanner(output(factory.createNodeArray([
      ...genImports([
        {
          mode: 'type',
          from: '@zdmin/ara-unplugin',
          imports: UTIL_TYPES.map(name => ({ name: getUtilTypeName(name) }))
        },
        {
          mode: 'type',
          from: getImportRelative(pairOutput, rootTypes),
          imports: [{ name: 'paths' }]
        }
      ]),
      factory.createIdentifier('\n'),
      ...Array.isArray(requests) ? requests.map(request => {
        return [
          ...UTIL_TYPES.map(name => createTypeAliasDeclaration({
            name: request.name,
            path: request.path,
            method: request.method,
            type: name
          })),
          factory.createIdentifier('\n')
        ]
      }).flat() : []
    ])))
  }
}

function genFileOfRequests({ item, pairTypeFile }: { 
  item: AstInputFile 
  pairTypeFile?: GenFile & { types: string[] }
}): GenFile {
  const imports = genImports([
    ...item.imports as AstInputImportNormalized[],
    ...(pairTypeFile ? [{
      mode: 'type' as const,
      from: `./${basename(pairTypeFile.output, '.ts')}`,
      imports: pairTypeFile.types.map(name => ({ name }))
    }] : [])
  ])
  const functions = Array.isArray(item.requests) ? item.requests.map(request => {
    return [
      createFunctionDeclaration({
        name: request.name,
        openapi: request.openapi,
        code: replaceRefRequestType(request.name, request.code),
        arguments: request.arguments || [],
        types: normalizeTypes(request.name, request.types)
      }),
      factory.createIdentifier('\n')
    ]
  }).flat() : []
  const content = output(factory.createNodeArray([
    ...imports,
    ...(imports.length ? [factory.createIdentifier('\n')] : []),
    ...functions
  ]))
  return {
    output: item.output,
    content: patchBanner(content)
  }
}

function normalizeTypes(name: string, types?: { [key: string]: string }) {
  if (!types) return {}
  return mapValues(types, code => replaceRefRequestType(name, code))
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
    const fileOfTypes = genFileOfRequestTypes({ 
      rootTypes, 
      pairOutput: item.output, 
      requests: item.requests 
    })
    const fileOfRequests = genFileOfRequests({ item, pairTypeFile: fileOfTypes })
    return [fileOfTypes, fileOfRequests]
  }).flat().filter(file => !!file)

  return { files, statistic: { functions: requests.length } }
}