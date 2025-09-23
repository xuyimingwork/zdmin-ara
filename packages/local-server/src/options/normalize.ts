import { DocNormalized, DocRaw, UserOptions, UserOptionsNormalized } from "@/types"
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
function normalizeDocOutDir(doc: Omit<DocRaw, 'url'>, outDir: string) {
  if (doc.outDir) return resolve(outDir, doc.outDir)
  if (doc.name) return resolve(outDir, doc.name)
  return outDir
}

// 待测试
export function normalizeDoc(doc: UserOptions['doc'], outDir: string): Array<DocNormalized> {
  if (!doc) return []
  // 单个状态时 name 为 ''
  if (typeof doc === 'string') return [{ name: '', url: doc, outDir: normalizeDocOutDir({}, outDir) }]
  // object 状态时是一定有 name 的
  if (!Array.isArray(doc) && isObjectLike(doc)) return keys(doc).map(name => {
    const item = doc[name]
    if (typeof item === 'string') return { name, url: item, outDir: normalizeDocOutDir({ name }, outDir) }
    name = typeof item.name === 'string' ? item.name : name
    return { 
      name,
      url: item.url, 
      outDir: normalizeDocOutDir({ ...item, name }, outDir)
    }
  })
  if (!Array.isArray(doc)) return []
  return doc.map(item => ({ ...item, outDir: normalizeDocOutDir(item, outDir) }))
}

export function normalizeOptions(options: UserOptions): UserOptionsNormalized {
  const cwd = typeof options.cwd === 'string' ? resolve(options.cwd) : process.cwd()
  const outDir = typeof options.outDir === 'string' ? resolve(cwd, options.outDir) : resolve(cwd, DEFAULT_OUT_DIR)
  const doc = normalizeDoc(options.doc, outDir)
  return {
    cwd,
    outDir,
    doc,
    transform: typeof options.transform === 'function' ? options.transform : () => ({}),
  }
}
