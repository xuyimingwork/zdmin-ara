import type { UtilType } from "@/transform/type"
import type { ImportData } from "@/types/import"
import type { OpenAPIPathOperationObject } from "@/types/openapi"
import { Simplify, SimplifyDeep } from "type-fest";

export interface ApiBaseData {
  /**
   * @description HTTP method
   */
  method: string, 
  /**
   * @description HTTP path
   */
  path: string, 
  /**
   * @description open api data for this api
   */
  openapi:  OpenAPIPathOperationObject,
}

export type ApiTransformerInput = Simplify<ApiBaseData & {
  /**
   * @description prev base transformer result
   */
  base: ApiTransformerBaseReturn
  /**
   * @description provide some ref content that will be replace by real code in generate
   */
  refs: { types: { [key in UtilType]: string } }
}>

export type ApiTransformerReturn = {
  /**
   * @description ignore this api, NOT generate code of this api.
   * @default false
   */
  ignore?: boolean
  /**
   * @description file path of this api's client code will be output.
   * relative path will generated under doc.outDir.
   * absolute path will generated as it is.
   */
  output?: string
  /**
   * @description function name of this api.
   */
  name?: string
  /**
   * @description function body of this api.
   * refs.types.xxx is ok in this field.
   * @example
   * `
   *   return axios({ ... })
   * `
   */
  code?: string
  /**
   * @description function arguments of this api.
   */
  parameters?: Array<string | {
    /** @description name of argument, eg: `options` */
    name: string
    /** @description make this argument optional, eg: `options?` */
    optional?: boolean
    /** @description make this argument as rest parameter, eg: `...options` */
    rest?: boolean
    /** 
     * @description add type for this argument, eg: `options: string`.
     * refs.types.xxx is ok in this field.
     */
    type?: string
  }>
  /**
   * @description imports of this api's code needs
   * @example
   * want: import 'vue'
   * conf: 'vue'
   * 
   * want: import Vue from 'vue'
   * conf: { from: 'vue', import: 'Vue' }
   * 
   * want: import * as Vue from 'vue'
   * conf: { from: 'vue', imports: [{ name: '*', alias: 'Vue' }] }
   * 
   * want: import { ref } from 'vue'
   * conf: { from: 'vue', imports: [{ name: 'ref' }] }
   * 
   * want: import { ref as myRef } from 'vue'
   * conf: { from: 'vue', imports: [{ name: 'ref', alias: 'myRef' }] } 
   * 
   * want: import { type Ref as MyRef } from 'vue'
   * conf: { from: 'vue', imports: [{ name: 'Ref', alias: 'MyRef', type: true }] } 
   */
  imports?: ImportData[]
  /**
   * @description type definitions.
   * refs.types.xxx is ok in this field.
   */
  types?: { 
    return?: string 
  },
  /**
   * @ignore NOT used right now.
   */
  debug?: boolean
}

type ApiTransformerBaseReturn = Simplify<ApiTransformerReturn & { [x: string | number | symbol]: unknown; }>

export interface ApiTransformer {
  (input: ApiTransformerInput): ApiTransformerReturn
}