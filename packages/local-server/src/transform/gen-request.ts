import { createFunctionDeclaration } from "@/transform/ast/function"
import { normalizeImports } from "@/transform/gen-imports"
import { print } from "@/transform/ast/printer"
import { getRequestTypeName, getUtilTypeName, replaceRefRequestType, UTIL_TYPES } from "@/transform/type"
import { getImportRelative, patchBanner } from "@/transform/utils"
import { groupBy, mapValues } from "es-toolkit"
import { each, isObject } from "es-toolkit/compat"
import { basename } from "path"
import ts from 'typescript'
import { createTypeAliasDeclaration } from "@/transform/ast/type"
import { createImportDeclarations } from "@/transform/ast/import"
import { OpenAPI } from "@/types/openapi"
import { FileData } from "@/types/file"
import { ImportDataNormalized } from "@/types/import"
import { GenResult } from "@/types/gen"
import { ApiBaseData, ApiTransformer } from "@/types/api"
import { baseTransformer } from "@/transform/transformer/base"

const factory = ts.factory

type AstApiData = ApiBaseData & Required<ReturnType<ApiTransformer>>
type AstFileData = {
  output: string
  imports: ImportDataNormalized[]
  requests?: Omit<AstApiData, 'imports' | 'output'>[]
}

type ForEachRequestCallback = (api: ApiBaseData) => void

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

function genFileOfRequestTypes({ rootTypes, pairOutput, requests }: {
  rootTypes?: string
  pairOutput: string
  requests?: AstFileData['requests']
}): (FileData & { types: string[] }) | undefined {
  if (!rootTypes) return
  return {
    output: pairOutput.replace(/\.ts$/, '.d.ts'),
    types: Array.isArray(requests) 
      ? requests.map(request => UTIL_TYPES.map(name => getRequestTypeName(request.name, name))).flat()
      : [],
    content: patchBanner(print(factory.createNodeArray([
      ...createImportDeclarations([
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
  item: AstFileData 
  pairTypeFile?: FileData & { types: string[] }
}): FileData {
  const imports = createImportDeclarations([
    ...item.imports as ImportDataNormalized[],
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
        arguments: normalizeArguments(request.name, request.arguments),
        types: normalizeTypes(request.name, request.types)
      }),
      factory.createIdentifier('\n')
    ]
  }).flat() : []
  const content = print(factory.createNodeArray([
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

function normalizeArguments(name: string, parameters: ReturnType<ApiTransformer>['arguments']): ReturnType<ApiTransformer>['arguments'] {
  if (!Array.isArray(parameters)) return []
  return parameters.map(item => {
    if (!isObject(item) || !item?.type) return item
    return { ...item, type: replaceRefRequestType(name, item.type) }
  })
}

export function genRequest({ openapi, transform, relocate, rootTypes }: {
  openapi: OpenAPI,
  transform: ApiTransformer
  relocate?: (output: string) => string
  rootTypes?: string
}): GenResult<{ functions: number }> {

  // 所有请求
  const requests = mapEachRequest<AstApiData>(openapi, ({ method, path, openapi }) => {
    const baseConfig = baseTransformer({ method, path, openapi })
    const config = transform({ method, path, openapi, base: baseConfig })
    const result = Object.assign({ openapi, method, path }, baseConfig, config)
    return {
      ...result,
      output: typeof relocate === 'function' ? relocate(result.output) : result.output
    }
  }).filter(item => !item.ignore)

  // 所有请求构成的文件
  const rawFiles: AstFileData[] = Object.keys(groupBy(requests, item => item.output))
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
    const fileOfTypes = genFileOfRequestTypes({ rootTypes, pairOutput: item.output, requests: item.requests })
    const fileOfRequests = genFileOfRequests({ item, pairTypeFile: fileOfTypes })
    return [fileOfTypes, fileOfRequests]
  }).flat().filter(file => !!file)

  return { files, statistic: { functions: requests.length } }
}