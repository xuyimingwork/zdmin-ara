import { patchBanner } from "@/transform/banner"
import { createFunctionDeclaration } from "@/transform/function"
import { genImports, normalizeImports } from "@/transform/gen-imports"
import { output } from "@/transform/printer"
import { AstInputFile, AstInputImportNormalized, AstInputRequest, GenRequestTransformer, GenRequestTransformerReturn, GenResult, OpenAPI, OpenAPIPathOperationObject } from "@/types"
import { camelCase, groupBy, kebabCase } from "es-toolkit"
import { each } from "es-toolkit/compat"
import { basename, dirname, normalize } from "path"
import ts from 'typescript'

const factory = ts.factory

type ForEachRequestCallback = (request: Parameters<GenRequestTransformer>[0]) => void

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

const baseTransformer: GenRequestTransformer = ({ path, method, openapi }) => {
  const base = basename(path)
  const dir = dirname(path).startsWith('/') 
    ? dirname(path).substring(1) 
    : dirname(path)
  return {
    output: normalize(dir || 'index').split('/').map(item => kebabCase(item)).join('/') + '.ts',
    name: camelCase(`${method}+${base}`),
    code: ''
  }
}

export function genRequest({ openapi, transform }: {
  openapi: OpenAPI, transform: (...args: Parameters<GenRequestTransformer>) => Partial<GenRequestTransformerReturn>
}): GenResult<{ functions: number }> {

  // 所有请求
  const requests = mapEachRequest<AstInputRequest>(openapi, ({ method, path, openapi }) => {
    const baseConfig = baseTransformer({ method, path, openapi })
    const config = transform({ method, path, openapi })
    return Object.assign({ openapi, method, path }, baseConfig, config)
  })

  // 所有请求构成的文件
  const rawFiles: AstInputFile[] = Object.keys(groupBy(requests, item => item.output)).map(output => {
    const fileRequests = requests.filter(item => item.output === output)
    const imports = normalizeImports(fileRequests.map(item => Array.isArray(item.imports) ? item.imports : []).flat())
    return {
      output,
      imports,
      requests: fileRequests.map(({ imports: _, ...item }) => item)
    }
  })

  const files = rawFiles.map(item => {
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
    return {
      output: item.output,
      content: patchBanner(content)
    }
  })

  return { files, statistic: { functions: requests.length } }
}