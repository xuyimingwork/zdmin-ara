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
      .then(content => {
        if (content === file.content) return 'same'
        // TODO: 忽略顶部 banner 进行比较
        // - 需要考虑自定义 banner 场景
        // - 设为可选项，允许忽略更新仅 banner 不同的场景，也允许强制更新
        return 'update'
      })
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
      return Promise.all(files.map(item => item.diff !== 'same' ? writep(item.output, item.content) : Promise.resolve()))
        .then(() => ({ files, statistic }))
    })
}