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

export type GenRequestTransformerReturn = {
  imports?: AstInputImport[]
  output: string
  name: string
  code: string
  arguments?: string[]
}

export interface GenRequestTransformer {
  (options: {
    // http 方法
    method: string, 
    // http 路径
    path: string, 
    // openapi 数据（函数层级）
    openapi: OpenAPIPathOperationObject
  }): GenRequestTransformerReturn
}

export type AstInputRequest = GenRequestTransformerReturn & {
  openapi: OpenAPIPathOperationObject
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