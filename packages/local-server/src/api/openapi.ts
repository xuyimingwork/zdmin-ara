import { DEFAULT_DATA_FILE, gen } from "@/transform/gen";
import { DEFAULT_TYPE_FILE } from "@/transform/gen-type";
import { DocNormalized, GenFile, OpenAPI, UserApiTransformer } from "@/types";
import { writep } from "@/utils/output";
import { kebabCase } from "es-toolkit";
import { resolve } from "path";

const RENAME_FILE_LIST = [DEFAULT_DATA_FILE, DEFAULT_TYPE_FILE]

export function previewOpenAPI({ openapi, doc, transform }: { 
  openapi: OpenAPI, 
  doc: DocNormalized,
  transform?: UserApiTransformer 
}) {
  // 转换过程需要知晓 doc 信息吗？为什么？
  // 转换过程不需要知晓，openapi => files，不需要知晓最终输出的文件位置（因为可以不输出）

  // TODO: rename 会导致 import 发生改变...
  // 需要在 gen 内部处理 rename 逻辑
  // gen 的 transform 包含对 openapi.json & openapi.d.ts 的处理吗？
  function rename(file: GenFile): GenFile {
    if (!RENAME_FILE_LIST.includes(file.output)) return file
    if (!doc.name) return file
    return { ...file, output: `${kebabCase(doc.name)}.${file.output}` }
  }

  // 放到 transform 中实现
  function subdir(file: GenFile): GenFile {
    return { ...file, output: resolve(doc.outDir, file.output) }
  }

  return gen({ 
    openapi, 
    transform: typeof transform === 'function' 
      ? (options) => transform({ ...options, doc: { ...doc, openapi } })
      : () => ({})
  }).then(({ files, statistic }) => {
    return { files: files.map(rename), statistic }
  }).then(({ files, statistic }) => {
    return { files: files.map(subdir), statistic }
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