import { UserDoc, UserDocNormalized, UserOptions, UserOptionsNormalized } from "@/types/option"
import { isObjectLike, keys } from "es-toolkit/compat"
import { resolve } from "path"

const DEFAULT_OUT_DIR = 'openapi-codegen'

/**
 * 1. doc.output 为绝对路径，使用该绝对路径
 * 2. doc.output 为相对路径，基于 outDir 拼接
 * 3. doc.output 不存在，基于 outDir 拼接 doc.name
 * 4. doc.name 不存在，使用 outDir
 * 
 * @param doc 
 * @param outDir 
 * @returns 
 */
function normalizeDocOutDir(doc: Omit<UserDoc, 'url'>, outDir: string) {
  if (doc.outDir) return resolve(outDir, doc.outDir)
  if (doc.name) return resolve(outDir, doc.name)
  return outDir
}

/**
 * 
 * @param doc OpenAPI 文档配置
 * @param outDir 项目输出路径
 * @returns 
 */
export function normalizeDoc(doc: UserOptions['doc'], outDir: string): Array<UserDocNormalized> {
  if (!doc) return []
  // 仅含 url 状态的文档
  if (typeof doc === 'string') return [{ url: doc, outDir: normalizeDocOutDir({}, outDir) }]
  // record 状态时一定有 name（为 key）
  if (!Array.isArray(doc) && isObjectLike(doc)) return keys(doc).map(name => {
    const item = doc[name]
    if (typeof item === 'string') return { url: item, name, outDir: normalizeDocOutDir({ name }, outDir) }
    // 优先取值中配置的 name
    name = typeof item.name === 'string' ? item.name : name
    return { url: item.url, name, outDir: normalizeDocOutDir({ ...item, name }, outDir) }
  })
  if (!Array.isArray(doc)) return []
  return doc.map(item => ({ ...item, outDir: normalizeDocOutDir(item, outDir) }))
}

export function normalizeOptions(options: UserOptions): UserOptionsNormalized {
  const cwd = typeof options.cwd === 'string' ? resolve(options.cwd) : process.cwd()
  const outDir = typeof options.outDir === 'string' ? resolve(cwd, options.outDir) : resolve(cwd, DEFAULT_OUT_DIR)
  const doc = normalizeDoc(options.doc, outDir)
  return {
    debug: false,
    cwd,
    outDir,
    doc,
    transform: typeof options.transform === 'function' ? options.transform : () => ({}),
  }
}
