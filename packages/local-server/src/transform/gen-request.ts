import { createFunctionDeclaration } from "@/transform/ast/function"
import { normalizeImports } from "@/transform/gen-imports"
import { print } from "@/transform/ast/printer"
import { getRequestTypeName, getUtilTypeName, replaceRefRequestType, TypeRef, UTIL_TYPES } from "@/transform/type"
import { getImportRelative, patchBanner } from "@/transform/utils"
import { groupBy, mapValues } from "es-toolkit"
import { each, fromPairs, isObject } from "es-toolkit/compat"
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
import { name as pkgName } from '~/package.json'

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

function genFileOfRequestTypes({ 
  pairOutput, 
  rootTypes, 
  utilTypes,
  requests, 
  banner 
}: {
  pairOutput: string
  rootTypes?: string
  utilTypes?: string
  requests?: AstFileData['requests']
  banner?: string
}): (FileData & { types: string[] }) | undefined {
  if (!rootTypes) return
  return {
    output: pairOutput.replace(/\.(ts|js)$/, '.meta.d.ts'),
    types: Array.isArray(requests) 
      ? requests.map(request => UTIL_TYPES.map(name => getRequestTypeName(request.name, name))).flat()
      : [],
    content: patchBanner(print(factory.createNodeArray([
      ...createImportDeclarations([
        {
          mode: 'type',
          from: utilTypes || pkgName,
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
    ])), banner)
  }
}

function genFileOfRequests({ item, pairTypeFile, banner }: { 
  item: AstFileData 
  pairTypeFile?: FileData & { types: string[] }
  banner?: string
}): FileData {
  const imports = createImportDeclarations([
    ...item.imports,
    ...(pairTypeFile ? [{
      mode: 'type' as const,
      from: `./${basename(pairTypeFile.output, '.ts')}`,
      imports: pairTypeFile.types.map(name => ({ name }))
    }] : [])
  ].map(importNormalized => {
    if (importNormalized.mode !== 'type') return importNormalized
    if (item.output.endsWith('.js')) return { ...importNormalized, jsdoc: true }
    return importNormalized
  }))
  const functions = Array.isArray(item.requests) ? item.requests.map(request => {
    return [
      ...createFunctionDeclaration({
        name: request.name,
        context: { 
          ...request, 
          output: item.output 
        },
        code: replaceRefRequestType(request.name, request.code),
        parameters: normalizeArguments(request.name, request.parameters),
        types: normalizeTypes(request.name, request.types),
        debug: request.debug
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
    content: patchBanner(content, banner)
  }
}

function normalizeTypes(name: string, types?: { [key: string]: string }) {
  if (!types) return {}
  return mapValues(types, code => replaceRefRequestType(name, code))
}

function normalizeArguments(name: string, parameters: ReturnType<ApiTransformer>['parameters']): ReturnType<ApiTransformer>['parameters'] {
  if (!Array.isArray(parameters)) return []
  return parameters.map(item => {
    if (!isObject(item) || !item?.type) return item
    return { ...item, type: replaceRefRequestType(name, item.type) }
  })
}

function toAstFiles(requests: AstApiData[]): AstFileData[] {
  if (!Array.isArray(requests)) return []
  const groups = groupBy(requests, item => item.output)
  const outputs = Object.keys(groups)
    .filter(output => {
      if (output.endsWith('.js')) return true
      if (output.endsWith('.ts')) return !(output.replace(/\.ts$/, '.js') in groups)
      return false
    })
  // 当 api.js 与 api.ts 同时存在，保留 api.js
  const uniqGroups = fromPairs(outputs.map(output => {
    if (output.endsWith('.ts')) return [output, groups[output]]
    const tsOutput = output.replace(/\.js$/, '.ts')
    if (!(tsOutput in groups)) return [output, groups[output]]
    return [output, [...groups[tsOutput], ...groups[output]]]
  }))
  return Object.keys(uniqGroups).map(output => {
    const requests = uniqGroups[output]
    const imports = normalizeImports(requests.map(item => Array.isArray(item.imports) ? item.imports : []).flat())
    return {
      output,
      imports,
      requests: requests.map(({ imports: _, ...item }) => item)
    }
  })
}

export function genRequest({ 
  openapi, 
  transform, 
  relocate, 
  rootTypes, 
  utilTypes,
  banner 
}: {
  openapi: OpenAPI,
  transform: ApiTransformer
  relocate?: (output: string) => string
  rootTypes?: string
  utilTypes?: string
  banner?: string
}): GenResult<{ functions: number }> {

  // 所有请求
  const requests = mapEachRequest<AstApiData>(openapi, ({ method, path, openapi }) => {
    const baseConfig = baseTransformer({ 
      method, path, openapi, refs: { types: TypeRef }
    })
    const config = transform({ 
      method, path, openapi, 
      base: baseConfig,
      refs: { types: TypeRef }
    })
    const result = Object.assign({ openapi, method, path }, baseConfig, config)
    return {
      ...result,
      output: typeof relocate === 'function' ? relocate(result.output) : result.output
    }
  }).filter(item => !item.ignore)

  // 所有请求构成的文件
  const rawFiles: AstFileData[] = toAstFiles(requests)
  
  const files = rawFiles.map(item => {
    const fileOfTypes = genFileOfRequestTypes({ 
      rootTypes, 
      utilTypes,
      pairOutput: item.output, 
      requests: item.requests,
      banner
    })
    const fileOfRequests = genFileOfRequests({ item, pairTypeFile: fileOfTypes, banner })
    return [fileOfTypes, fileOfRequests]
  }).flat().filter(file => !!file)

  return { files, statistic: { functions: requests.length } }
}