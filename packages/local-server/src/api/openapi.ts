import { DEFAULT_DATA_FILE, gen } from "@/transform/gen";
import { DEFAULT_TYPE_FILE } from "@/transform/gen-type";
import { FileData } from "@/types/file";
import { OpenAPI } from "@/types/openapi";
import { UserApiTransformer, UserDocNormalized } from "@/types/option";
import { writep } from "@/utils/output";
import { kebabCase } from "@/utils/string";
import { access, readFile } from "fs/promises";
import { resolve } from "path";

const RENAME_FILE_LIST = [DEFAULT_DATA_FILE, DEFAULT_TYPE_FILE]

const exists = (path: string) => access(path)
    .then(() => true)
    .catch(() => false)

async function getFileDiff(file: FileData): Promise<'new' | 'update' | 'same' | 'unknown'> {
  const existed = await exists(file.output)
  if (!existed) return 'new'
  return readFile(file.output, 'utf-8')
      .then(res => res === file.content ? 'same' : 'update')
      .catch(e => 'unknown')
}

/**
 * TODO: doc 为空状态待处理
 * 
 * @param  
 * @returns 
 */
export function previewOpenAPI({ openapi, doc, transform, banner, typeGettersModule }: { 
  openapi: OpenAPI, 
  doc: UserDocNormalized,
  transform: UserApiTransformer,
  banner?: string
  typeGettersModule?: string 
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
    },
    typeGettersModule,
    // TODO: 是否收归到该处统一修改
    banner
  })
    .then((res) => {
      return Promise.all(res.files.map(file => new Promise<FileData & { diff: Awaited<ReturnType<typeof getFileDiff>> }>((resolve) => {
        getFileDiff(file).then(diff => {
          resolve({
            ...file, diff
          })
        })
      }))).then(files => ({
        ...res,
        files
      }))
    })
}

export function outputOpenAPI({ openapi, doc, transform, banner, typeGettersModule }: { 
  openapi: OpenAPI, 
  doc: UserDocNormalized,
  transform: UserApiTransformer 
  banner?: string
  typeGettersModule?: string 
}) {
  return previewOpenAPI({ openapi, doc, transform, banner, typeGettersModule })
    .then(({ files, statistic }) => {
      return Promise.all(files.map(item => writep(item.output, item.content)))
        .then(() => ({ files, statistic }))
    })
}