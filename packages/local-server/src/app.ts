import connect from 'connect';
import { createServer } from 'http';
import cors from 'cors'
import bodyParser from 'body-parser'
import ConnectRest from 'connect-rest';
import { writeFile } from 'fs/promises';
import { transform } from '@/transform/transform';
import { mkdirp } from 'mkdirp';
import { resolve } from 'path';
import getPort, { portNumbers } from 'get-port';
import { isObjectLike, mapValues, values } from 'es-toolkit/compat';

const BASE_PORT = 9125
const BASE_URL = '/openapi-codegen'

// output => 该服务所有内容输出位置
// doc.output => 这份文档的所有内容输出位置（涵盖该文档生成文件）
//   => 出现重合怎么办？
//   => 与 transform 有冲突？doc 级需要有 transform 动作吗？
//   => 
// output 默认为 ${options.cwd}/openapi-codegen，可以另行指定
// doc.output 默认为 ${options.cwd}/${doc.name}
// doc 文件名 => ${doc.name}.openapi.d.ts and ${doc.name}.openapi.json
// 
type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }
type Doc = string | { 
  name?: string,
  path: string,
  // 默认为：${options.output}/${doc.name}
  output?: string
}
type NormalDoc = Required<Extract<Doc, { [key: string]: any }>>
type Docs = string | Array<WithRequired<Extract<Doc, { [key: string]: any }>, 'name'>> | { [name: string]: Doc }
type NormalDocs = Array<NormalDoc>
interface Options {
  cwd: string
  // 输出根文件夹 => default is ${options.output}/openapi-codegen
  output: string
  // OpenAPI 文档地址
  docs: Docs,
  // API 转换函数
  transform: any
}

function createRest(options: Options) {
  const { output: root } = options

  const rest = ConnectRest.create({
    context: BASE_URL,
  })

  /**
   * 后端服务接口需要仔细设计
   * - 1 个服务可以对应 n 个项目（项目可以用本地路径区分）
   * - 1 个项目可以对应 n 个 OpenAPI 文档（使用文档路径？）
   */

  rest.post('/openapi', (request, content) => {
    console.log('request to openapi')
    if (!content?.data) return Promise.resolve({ ok: false, message: 'No OpenAPI Doc Content' });
    if (!content?.name) return Promise.resolve({ ok: false, message: 'No OpenAPI Doc Name' });
    const doc = (options.docs as NormalDocs).find(item => item.name === content.name)
    if (!doc) return Promise.resolve({ ok: false, message: 'OpenAPI Doc Not Config' });
    return transform({ openapi: content.data })
      .then(({ files, count }) => {
        files = [...files, { file: 'openapi.json', content: JSON.stringify(content.data, undefined, 2) }]
        files = doc.name ? files.map(item => {
          if (!['openapi.json', 'openapi.d.ts'].includes(item.file)) return item
          return { file: `${doc.name}.${item.file}`, content: item.content }
        }) : files
        files = files.map(({ file, content }) => {
          const path = resolve(doc.output, file.startsWith('/') ? file.slice(1) : file);
          return { file: path, content }
        })
        return { files, count }
      })
      .then(({ files, count }) => {
        return Promise.all(files.map(item => {
          const dir = item.file.slice(0, item.file.lastIndexOf('/'))
          return mkdirp(dir).then(() => writeFile(item.file, item.content, 'utf8'))
        })).then(() => ({ files, count }))
      })
      .then(({ count, files }) => ({ ok: true, data: { count, files } }))
      .catch(err => ({ ok: false, message: err.message }));
  })

  rest.get('/project', (request, content) => {
    return Promise.resolve({ 
      ok: true, 
      message: 'OpenAPI CodeGen Local Server is running',
      data: {
        path: options.cwd,
        output: options.output,
        docs: options.docs
      }
    });
  })

  return rest
}

function createConnect(options: Options) {
  const app = connect();
  app.use( bodyParser.urlencoded( { extended: true, limit: '50mb' } ) )
  app.use( bodyParser.json({ limit: '50mb' }) )
  app.use(cors())
  app.use(createRest(options).processRequest());
  return app;
}

/**
 * 外部项目需要配置些什么东西？
 * 需要配置 root 吗？如果都不配置可以用吗？
 * 0 config
 * cwd 表示当前项目位置，主要用于区分不同项目
 */
export function main({ 
  // 项目地址
  cwd = process.cwd(),
  // 文件输出地址
  output = `${cwd}/openapi-codegen`,
  docs = undefined,
  transform = undefined
}: Partial<Options> = {}) {
  return getPort({ port: portNumbers(BASE_PORT, BASE_PORT + 99) })
    .then(port => {
      return new Promise((_resolve) => {
        createServer(createConnect({ 
          cwd,
          output, 
          docs: normalizeDocs(docs, output),
          transform,
        })).listen({ port }, () => _resolve({ port }))
      })
    })
    .then(({ port }: any) => {
      console.log(`Local server is running on http://localhost:${port}${BASE_URL}`);
    })
}

function normalizeDocs(docs?: Docs, output?: string): NormalDocs {
  if (!docs) return []
  // 单个状态时一定为 name 一定为 doc-0
  if (typeof docs === 'string') docs = [{ name: '', path: docs }]
  // object 状态时是一定有 name 的
  if (!Array.isArray(docs) && isObjectLike(docs)) docs = values(mapValues(docs, (item, name) => {
    if (typeof item === 'string') return { name, path: item }
    return { name, ...item }
  }))
  // 数组状态顺序来自事先指定
  return (docs as Extract<Docs, Array<any>>).map((item) => {
    const _output = name => resolve(output || '', `${name}`) 
    return {
      output: _output(item.name),
      ...item,
    }
  })
}
