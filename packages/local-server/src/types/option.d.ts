import { ApiTransformer, ApiTransformerReturn } from "@/types/api"
import { OpenAPI } from "@/types/openapi"
import { SetOptional, SetRequired, Simplify, SimplifyDeep } from "type-fest"

/**
 * @description User Options
 */
export interface UserOptions {
  /**
   * @ignore NOT used right now.
   */
  debug?: boolean
  /**
   * @description project root dir
   * @default process.cwd()
   */
  cwd?: string
  /**
   * @description dir of all generated code. \
   * if relative, it will under ${options.cwd}. \
   * if absolute, it absolute as it is.
   * @default 'openapi-codegen'
   */
  outDir?: string
  /**
   * @description openapi doc
   */
  doc?: UserDoc['url']
    | Array<SetRequired<UserDoc, 'name'>> 
    | { [name: string]: UserDoc['url'] | UserDoc },
  /**
   * @description transform every api.
   */
  transform?: UserApiTransformer
  /**
   * @description banner of generated files
   */
  banner?: string
  /**
   * @description config Getter types import from 
   * 
   * @example
   * ```ts
   * import type { 
   *   GetResponse, 
   *   GetRequestOptions, 
   *   GetRequestBody, 
   *   GetRequestQuery, 
   *   GetRequestParams 
   * } from "${typeGettersModule}";
   * ```
   */
  typeGettersModule?: string
}

export interface UserDoc {
  /**
   * @description doc url
   */
  url: string
  /**
   * @description doc name. \
   * effect raw data output & api outDir. \
   * strongly recommend to provide a name.
   * 
   * doc's raw data will output to `${name}.openapi.json`. \
   * doc's raw d.ts file will output to `${name}.openapi.d.ts`. \
   * if name is missing, `openapi.json` & `openapi.d.ts` will be use.
   * 
   * @default ''
   */
  name?: string
  /**
   * @description dir of this doc's generated code. \
   * if relative, it will under ${options.outDir}. \
   * if absolute, it absolute as it is.
   * @default ${doc.name} || ''
   */
  outDir?: string
}

export interface UserApiTransformer {
  (input: UserApiTransformerInput): UserApiTransformerReturn
}

export type UserApiTransformerInput = Simplify<{
  /**
   * @description doc config of current api
   */
  doc: Simplify<UserDocNormalized & { 
    /**
     * @description whole openapi data of this doc
     */
    openapi: OpenAPI 
  }>
} & Parameters<ApiTransformer>['0']>

/**
 * @see {@link ApiTransformerReturn}
 */
export type UserApiTransformerReturn = Simplify<Partial<ApiTransformerReturn>>

export type UserDocNormalized = SetRequired<UserDoc, 'outDir'>
export type UserOptionsNormalized = SetOptional<Required<Omit<UserOptions, 'doc'>> & { 
  doc: Array<UserDocNormalized> 
}, 'banner' | 'typeGettersModule'>
