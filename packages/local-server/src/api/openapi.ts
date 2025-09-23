import { DEFAULT_DATA_FILE, gen } from "@/transform/gen";
import { DEFAULT_TYPE_FILE } from "@/transform/gen-type";
import { DocNormalized, OpenAPI, UserApiTransformer } from "@/types";
import { writep } from "@/utils/output";
import { kebabCase } from "es-toolkit";
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
  doc: DocNormalized,
  transform?: UserApiTransformer 
}) {
  const userTransformer: Parameters<typeof gen>['0']['transform'] = typeof transform === 'function' 
    ? (options) => transform({ ...options, doc: { ...doc, openapi } }) 
    : () => ({})

  // 内部均使用绝对路径（import 需要）
  return gen({ 
    openapi, 
    transform: userTransformer,
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
  doc: DocNormalized,
  transform?: UserApiTransformer 
}) {
  return previewOpenAPI({ openapi, doc, transform })
    .then(({ files, statistic }) => {
      return Promise.all(files.map(item => writep(item.output, item.content)))
        .then(() => ({ files, statistic }))
    })
}