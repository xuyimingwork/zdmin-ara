import { DEFAULT_DATA_FILE, gen } from "@/transform/gen";
import { DEFAULT_TYPE_FILE } from "@/transform/gen-type";
import { OpenAPI } from "@/types/openapi";
import { UserApiTransformer, UserDocNormalized } from "@/types/option";
import { writep } from "@/utils/output";
import { kebabCase } from "@/utils/string";
import { resolve } from "path";

const RENAME_FILE_LIST = [DEFAULT_DATA_FILE, DEFAULT_TYPE_FILE]

/**
 * TODO: doc 为空状态待处理
 * 
 * @param  
 * @returns 
 */
export function previewOpenAPI({ openapi, doc, transform }: { 
  openapi: OpenAPI, 
  doc: UserDocNormalized,
  transform: UserApiTransformer
}) {
  return gen({ 
    openapi, 
    transform: (options) => transform({ ...options, doc: { ...doc, openapi } }),
    relocate: (output) => {
      // 为避免多文件输出到同一目录冲突，统一改名
      output = RENAME_FILE_LIST.includes(output) && doc.name 
        ? `${kebabCase(doc.name)}.${output}`
        : output
      return resolve(doc.outDir, output)
    }
  })
}

export function outputOpenAPI({ openapi, doc, transform }: { 
  openapi: OpenAPI, 
  doc: UserDocNormalized,
  transform: UserApiTransformer 
}) {
  return previewOpenAPI({ openapi, doc, transform })
    .then(({ files, statistic }) => {
      return Promise.all(files.map(item => writep(item.output, item.content)))
        .then(() => ({ files, statistic }))
    })
}