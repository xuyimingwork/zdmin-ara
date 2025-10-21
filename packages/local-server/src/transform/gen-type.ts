import v3OpenAPITS, { astToString as v3AstToString } from "openapi-typescript7";
import v2OpenAPITS from "openapi-typescript5";
import { isOpenAPI2, isOpenAPI3, patchBanner } from "@/transform/utils";
import { OpenAPI } from "@/types/openapi";
import { GenResult } from "@/types/gen";

export const DEFAULT_TYPE_FILE = 'openapi.d.ts'

function getTypeContent({ openapi, banner }: { openapi: OpenAPI, banner?: string }): Promise<string> {
  if (isOpenAPI2(openapi)) return v2OpenAPITS(openapi, { commentHeader: patchBanner('', banner) }).catch(() => '')
  if (isOpenAPI3(openapi)) return v3OpenAPITS(openapi).then(ast => patchBanner(v3AstToString(ast), banner)).catch(() => '')
  return Promise.resolve('')
}

export async function genType({ openapi, banner }: { openapi: OpenAPI, banner?: string }): Promise<GenResult> {
  return getTypeContent({ openapi, banner })
    .then(content => {
      if (!content) return { files: [] }
      return {
        files: [{
          output: DEFAULT_TYPE_FILE,
          content
        }]
      }
    })
}