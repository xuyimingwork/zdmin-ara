import v3OpenAPITS, { astToString as v3AstToString } from "openapi-typescript7";
import v2OpenAPITS from "openapi-typescript5";
import { GenResult, OpenAPI } from "@/types";
import { isOpenAPI2, isOpenAPI3, patchBanner } from "@/transform/utils";

export const DEFAULT_TYPE_FILE = 'openapi.d.ts'

export async function genType({ openapi }: { openapi: OpenAPI }): Promise<GenResult> {
  if (isOpenAPI2(openapi)) return {
    files: [{
      output: DEFAULT_TYPE_FILE,
      content: await v2OpenAPITS(openapi, { commentHeader: patchBanner('') })
    }]
  }
  if (isOpenAPI3(openapi)) return {
    files: [{
      output: DEFAULT_TYPE_FILE,
      content: patchBanner(v3AstToString(await v3OpenAPITS(openapi)))
    }]
  }
  return Promise.resolve({ files: [] })
}

/** 手动导入做技术验证，后续自动生成 */
/** 手动导入做技术验证，后续自动生成 */