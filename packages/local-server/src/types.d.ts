import type { 
  OpenAPI2, 
  PathItemObject as OpenAPIPathItemObject2,
  OperationObject as OpenAPIOperationObject2,
} from "openapi-typescript5";
import type { 
  OpenAPI3, 
  PathItemObject as OpenAPIPathItemObject3,
  OperationObject as OpenAPIOperationObject3,
} from "openapi-typescript7";

export type DocRaw = {
  url: string
  name?: string
  outDir?: string
}

export type UserApiTransformer = (options: 
  { 
    doc: Required<DocRaw> & { openapi: OpenAPI } 
    base: Required<GenRequestTransformerReturn>
  } & Parameters<GenRequestTransformer>['0']
) => Partial<GenRequestTransformerReturn>

export type DocNormalized = Required<DocRaw>
export interface UserOptions {
  // 项目文件夹
  cwd?: string
  // 输出根文件夹 => default is ${options.cwd}/openapi-codegen
  outDir?: string
  /** OpenAPI 文档访问地址，单文档下必须指定 name */
  doc?: DocRaw['url'] /* 不允许单个对象形式，与对象形式冲突 */
    | Array<WithRequired<DocRaw, 'name'>> 
    | { [name: string]: DocRaw['url'] | DocRaw },
  // API 转换函数
  transform?: UserApiTransformer
}

export type UserOptionsNormalized = Required<Omit<UserOptions, 'doc'>> & { doc: Array<DocNormalized> }

export type GenFile = {
  output: string
  content: string
}

export type GenResult<T = void> = T extends { [key: string]: number } 
  ? {
    files: GenFile[]
    statistic: T
  } 
  : { 
    files: GenFile[] 
  }

export type OpenAPI = OpenAPI2 | OpenAPI3
export type OpenAPIPathOperationObject = OpenAPIOperationObject2 | OpenAPIOperationObject3

export type { 
  OpenAPI2, 
  OpenAPI3,
}

export interface GenRequestTransformer {
  (options: {
    // http 方法
    method: string, 
    // http 路径
    path: string, 
    // openapi 数据（函数层级）
    openapi: OpenAPIPathOperationObject,
    // base transformer 产生值
    base: Required<GenRequestTransformerReturn>
  }): {
    /* 输出文件 */
    output: string
    /* 函数名 */
    name: string
    /* 函数体 */
    code: string
    /* 函数入参 */
    arguments?: string[]
    /* 函数依赖 */
    imports?: AstInputImport[]
    /* 类型声明 */
    types?: { 
      return?: string 
    }
  }
}

export type GenRequestTransformerOptions = Parameters<GenRequestTransformer>['0']
export type GenRequestTransformerReturn = ReturnType<GenRequestTransformer>

export type AstInputRequest = GenRequestTransformerReturn & {
  openapi: OpenAPIPathOperationObject
  path: string,
  method: string
}

export type AstInputFile = {
  output: string
  imports?: AstInputImport[] | AstInputImportNormalized[]
  requests?: Omit<AstInputRequest, 'imports' | 'output'>[]
}

export type AstInputImportSimple = string
export type AstInputImportDefault = {
  from: string,
  import: string // alias
}
export type AstInputImportMix = {
  from: string,
  imports: Array<string | {
    name: string
    alias?: string, 
    type?: boolean
  }>
}
export type AstInputImport = AstInputImportSimple | AstInputImportDefault | AstInputImportMix

export type AstInputImportNormalizedSimple = {
  // import 'vue'
  mode: 'simple'
  from: string
}

export type AstInputImportNormalizedDefault = {
  // import Vue from 'vue'
  mode: 'default'
  from: string
  alias: string
}

export type AstInputImportNormalizedStar = {
  // import * as Vue from 'vue'
  mode: 'star',
  from: string
  alias: string
}

export type AstInputImportNormalizedType = {
  // import type { Ref as MyRef } from 'vue'
  mode: 'type'
  from: string
  imports: { name: string, alias?: string }[]
}

export type AstInputImportNormalizedCommon = {
  // import { ref as myRef, computed } from 'vue'
  mode: 'common'
  from: string
  imports: { name: string, alias?: string }[]
}

export type AstInputImportNormalized = AstInputImportNormalizedSimple 
| AstInputImportNormalizedDefault 
| AstInputImportNormalizedStar 
| AstInputImportNormalizedType 
| AstInputImportNormalizedCommon

type Get<T, K> = K extends keyof T
  ? T[K]
  : K extends `${infer First}.${infer Rest}`
    ? Get<Get<T, First>, Rest>
    : never

export type GetResponse<paths, path extends string, method extends string> = Get<Get<paths, `${path}.${method}.responses`>['200'], 'schema'>
export type GetRequestQuery<paths, path extends string, method extends string> = Get<paths, `${path}.${method}.parameters.query`>
export type GetRequestBody<paths, path extends string, method extends string> = Get<paths, `${path}.${method}.parameters.body.body`>

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }