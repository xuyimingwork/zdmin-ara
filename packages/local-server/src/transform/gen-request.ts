import { createFunctionDeclaration } from "@/transform/ast/function"
import { normalizeImports } from "@/transform/gen-imports"
import { print } from "@/transform/ast/printer"
import { getRequestName, getRequestTypeInUseFromCodes, getRequestTypeName, getUtilTypeName, normalizeRequestType, TypeRef, UTIL_TYPES } from "@/transform/type"
import { getImportRelative, patchBanner } from "@/transform/utils"
import { groupBy, mapValues, sortBy, uniqBy } from "es-toolkit"
import { each, fromPairs, isObject, values } from "es-toolkit/compat"
import { basename } from "path"
import { factory } from 'typescript'
import { createTypeAliasDeclaration } from "@/transform/ast/type"
import { createImportDeclarations } from "@/transform/ast/import"
import { OpenAPI } from "@/types/openapi"
import { FileData } from "@/types/file"
import { ImportDataNormalized, ImportDataNormalizedType } from "@/types/import"
import { GenResult } from "@/types/gen"
import { ApiBaseData, ApiTransformer } from "@/types/api"
import { baseTransformer } from "@/transform/transformer/base"
import { name as pkgName } from '~/package.json'

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

function getRequestTypes(requests?: AstFileData['requests']): string[] {
  if (!Array.isArray(requests)) return []
  return requests.map(request => {
    const parameters = normalizeArguments(request.name, request.parameters) || []
    return getRequestTypeInUseFromCodes(request.name, [
      request.code, 
      ...values(request.types), 
      ...parameters.filter(parameter => isObject(parameter) && parameter.type).map(parameter => (parameter as { type: string }).type)
    ].filter(item => !!item))
  }).flat()
}

function getPairTypeImportDeclarations(pairTypeFile?: FileData & { types: string[] }, requests?: AstFileData['requests']): ImportDataNormalizedType[] {
  if (!pairTypeFile) return []
  const types = pairTypeFile.types.filter(name => getRequestTypes(requests).includes(name)).sort()
  if (!types.length) return []
  const needBreakLine = types.length >= (UTIL_TYPES.length * 2)
  const breadLineBefore = (item: string) => `\n  ${item}`
  const breadLineAfter = (item: string) => `${item}\n`
  return [{
    mode: 'type',
    from: `./${basename(pairTypeFile.output, '.ts')}`,
    imports: types.map((type, i) => {
      if (!needBreakLine) return { name: type }
      const isLastType = i === (types.length - 1)
      if (!types[i - 1] || getRequestName(type) !== getRequestName(types[i - 1])) return { name: breadLineBefore(isLastType ? breadLineAfter(type) : type) }
      if (isLastType) return { name: breadLineAfter(type) }
      return { name: type }
    })
  }]
}

function genFileOfRequests({ item, pairTypeFile, banner }: { 
  item: AstFileData 
  pairTypeFile?: FileData & { types: string[] }
  banner?: string
}): FileData {
  const imports = createImportDeclarations([
    ...item.imports,
    ...getPairTypeImportDeclarations(pairTypeFile, item.requests)
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
        code: normalizeRequestType(request.name, request.code, !pairTypeFile),
        parameters: normalizeArguments(request.name, request.parameters, !pairTypeFile),
        types: normalizeTypes(request.name, request.types, !pairTypeFile),
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

function normalizeTypes(name: string, types?: { [key: string]: string }, noRequestType?: boolean) {
  if (!types) return {}
  return mapValues(types, code => normalizeRequestType(name, code, noRequestType))
}

function normalizeArguments(name: string, parameters: ReturnType<ApiTransformer>['parameters'], noRequestType?: boolean): ReturnType<ApiTransformer>['parameters'] {
  if (!Array.isArray(parameters)) return []
  return parameters.map(item => {
    if (!isObject(item) || !item?.type) return item
    return { ...item, type: normalizeRequestType(name, item.type, noRequestType) }
  })
}

function toAstFiles(requests: AstApiData[]): AstFileData[] {
  if (!Array.isArray(requests)) return []
  // 依据输出文件分组
  const groups = groupBy(requests, item => item.output)
  // 当 api.js 与 api.ts 同时存在，保留 api.js
  const outputs = Object.keys(groups)
    .filter(output => {
      if (output.endsWith('.js')) return true
      // ts 仅在没有对应 js 文件时保留
      if (output.endsWith('.ts')) return !(output.replace(/\.ts$/, '.js') in groups)
      return false
    })
  const uniqGroups = fromPairs(outputs.map(output => {
    if (output.endsWith('.ts')) return [output, groups[output]]
    const tsOutput = output.replace(/\.js$/, '.ts')
    if (!(tsOutput in groups)) return [output, groups[output]]
    // js/ts 都存在时，保留 js，ts 内请求合并到 js
    return [output, [...groups[tsOutput], ...groups[output]]]
  }))
  return Object.keys(uniqGroups).map(output => {
    // 同文件同名函数去重（仅保留第一个）
    const requests = uniqBy(uniqGroups[output], item => item.name)
    const imports = normalizeImports(requests.map(item => Array.isArray(item.imports) ? item.imports : []).flat())
    return {
      output,
      imports,
      requests: sortBy(requests.map(({ imports: _, ...item }) => item), [item => item.name])
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

  // 所有请求，进行转换
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

  // 所有请求构成的文件原始数据
  const rawFiles: AstFileData[] = toAstFiles(requests)
  
  // 生成类型文件与函数文件
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