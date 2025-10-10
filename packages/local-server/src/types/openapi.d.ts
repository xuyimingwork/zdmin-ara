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
import type { ConditionalKeys, Get, SetOptional, IsEqual } from "type-fest";

export type OpenAPI = OpenAPI2 | OpenAPI3
export type OpenAPIPathOperationObject = OpenAPIOperationObject2 | OpenAPIOperationObject3

export type { 
  OpenAPI2, 
  OpenAPI3,
}

export type GetResponse<paths, path extends string, method extends string> = Get<Get<paths, `${path}.${method}.responses`>['200'], 'schema'>
export type GetRequestParams<paths, path extends string, method extends string> = Get<paths, `${path}.${method}.parameters.path`>
export type GetRequestQuery<paths, path extends string, method extends string> = Get<paths, `${path}.${method}.parameters.query`>
// TODO: 兼容 v2(formData) & v3(requestBody)
export type GetRequestBody<paths, path extends string, method extends string> = Get<paths, `${path}.${method}.parameters.body.body`>
type GetRequestOptionsRaw<paths, path extends string, method extends string> = {
  params: GetRequestParams<paths, path, method>
  query: GetRequestQuery<paths, path, method>
  body: GetRequestBody<paths, path, method>
}
type TypeKeys<O, VT> = keyof {
  [K in keyof O as (IsEqual<O[K], VT> extends true ? K : never)]: O[K];
}
// make unknown property optional
export type GetRequestOptions<paths, path extends string, method extends string> = SetOptional<
  GetRequestOptionsRaw<paths, path, method>,
  TypeKeys<GetRequestOptionsRaw<paths, path, method>, unknown>
>
