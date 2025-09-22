import v3OpenAPITS, { astToString as v3AstToString } from "openapi-typescript7";
import v2OpenAPITS from "openapi-typescript5";
import { patchBanner } from "@/transform/banner";
import { GenResult, OpenAPI } from "@/types";
import { isOpenAPI2, isOpenAPI3 } from "@/transform/utils";

export async function genType({ openapi }: { openapi: OpenAPI }): Promise<GenResult> {
  if (isOpenAPI2(openapi)) return {
    files: [{
      output: 'openapi.d.ts',
      content: await v2OpenAPITS(openapi, { commentHeader: patchBanner('') })
    }]
  }
  if (isOpenAPI3(openapi)) return {
    files: [{
      output: 'openapi.d.ts',
      content: patchBanner(v3AstToString(await v3OpenAPITS(openapi)))
    }]
  }
  return Promise.resolve({ files: [] })
}

/** 手动导入做技术验证，后续自动生成 */
// import type { paths } from '../../../gpx.openapi'
// type Get<T, K> = K extends keyof T
//   ? T[K]
//   : K extends `${infer First}.${infer Rest}`
//     ? Get<Get<T, First>, Rest>
//     : never
// type GetResponse<path extends string, method extends string> = Get<Get<paths, `${path}.${method}.responses`>['200'], 'schema'>
/** 手动导入做技术验证，后续自动生成 */