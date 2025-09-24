import { ApiTransformer } from "@/types/api"
import { OpenAPI } from "@/types/openapi"
import { SetRequired } from "type-fest"

/**
 * @description 用户 OpenAPI 文档配置
 */
export interface UserDoc {
  /**
   * @description 文档地址
   */
  url: string
  /**
   * @description 文档名
   */
  name?: string
  /**
   * @description 文档输出路径
   */
  outDir?: string
}

/**
 * @description 用户配置
 */
export interface UserOptions {
  /**
   * @description 项目文件夹
   */
  cwd?: string
  /**
   * @description 输出路径
   * @default `${options.cwd}/openapi-codegen`
   */
  outDir?: string
  /**
   * @description OpenAPI 文档
   */
  doc?: UserDoc['url']
    | Array<SetRequired<UserDoc, 'name'>> 
    | { [name: string]: UserDoc['url'] | UserDoc },
  /**
   * @description 单个 Api 转换器
   */
  transform?: UserApiTransformer
}

/**
 * @description 用户侧的 API 转换器
 */
export interface UserApiTransformer {
  (options: {
    doc: UserDocNormalized & { openapi: OpenAPI }
  } & Parameters<ApiTransformer>['0']): Partial<ReturnType<ApiTransformer>>
}

export type UserDocNormalized = SetRequired<UserDoc, 'outDir'>
export type UserOptionsNormalized = Required<Omit<UserOptions, 'doc'>> & { doc: Array<UserDocNormalized> }
