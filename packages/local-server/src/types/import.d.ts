export type ImportData = ImportDataSimple | ImportDataDefault | ImportDataMix

/**
 * @example import 'vue'
 */
export type ImportDataSimple = string

/**
 * @example import Vue from 'vue'
 */
export type ImportDataDefault = {
  from: string,
  import: string
}

/**
 * @example 
 * import * as Vue from 'vue'
 * import { ref } from 'vue'
 * import { ref as myRef } from 'vue'
 * import { type Ref as MyRef } from 'vue'
 */
export type ImportDataMix = {
  from: string,
  imports: Array<string | {
    name: string
    alias?: string, 
    type?: boolean
  }>
}

export type ImportDataNormalized = ImportDataNormalizedSimple 
| ImportDataNormalizedDefault 
| ImportDataNormalizedStar 
| ImportDataNormalizedType 
| ImportDataNormalizedCommon

/**
 * @example import 'vue'
 */
export type ImportDataNormalizedSimple = {
  mode: 'simple'
  from: string
}

/**
 * @example import Vue from 'vue' 
 */ 
export type ImportDataNormalizedDefault = {
  mode: 'default'
  from: string
  alias: string
}

/**
 * @example import * as Vue from 'vue'
 */
export type ImportDataNormalizedStar = {
  mode: 'star',
  from: string
  alias: string
}

/**
 * @example import type { Ref as MyRef } from 'vue'
 */
export type ImportDataNormalizedType = {
  mode: 'type'
  from: string
  imports: { name: string, alias?: string }[]
}

/**
 * @example import { ref as myRef, computed } from 'vue'
 */
export type ImportDataNormalizedCommon = {
  mode: 'common'
  from: string
  imports: { name: string, alias?: string }[]
}
