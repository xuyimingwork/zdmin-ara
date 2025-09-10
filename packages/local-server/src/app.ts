import connect from 'connect';
import { createServer } from 'http';
import cors from 'cors'
import bodyParser from 'body-parser'
import ConnectRest from 'connect-rest';
import { rmdir, writeFile } from 'fs/promises';
import { transform } from '@/transform/transform';
import { mkdirp } from 'mkdirp';
import { resolve } from 'path';
import getPort, { portNumbers } from 'get-port';
import { isObjectLike, mapValues, values } from 'es-toolkit/compat';

const BASE_PORT = 9125
const BASE_URL = '/openapi-codegen'

type Doc = string | { 
  name?: string,
  path: string,
  // default is ${options.output}/openapi-codegen/${doc.name}
  output?: string
}
type NormalDoc = Required<Extract<Doc, { [key: string]: any }>>
type Docs = string | Array<Doc> | { [name: string]: Doc }
type NormalDocs = Array<NormalDoc>
interface Options {
  cwd: string
  // 输出根文件夹
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
    if (!content?.data) return Promise.reject(new Error('Invalid content'));
    return rmdir(root, { recursive: true }).then(async () => {
      const { files, count } = await transform({ openapi: content.data });
      return Promise.all([
        ...files, 
        { file: 'openapi.json', content: JSON.stringify(content.data, undefined, 2) }
      ].map(({ file, content }) => {
        const path = resolve(root, file.startsWith('/') ? file.slice(1) : file);
        const dir = path.slice(0, path.lastIndexOf('/'))
        return mkdirp(dir).then(() => writeFile(path, content, 'utf8'))
      }))
      .then(() => ({ count, files }))
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
 * 
 */
function main({ 
  output = process.cwd(),
  docs = undefined,
  transform = undefined
}: Partial<Omit<Options, 'cwd'>> = {}) {
  return getPort({ port: portNumbers(BASE_PORT, BASE_PORT + 99) })
    .then(port => {
      return new Promise((_resolve) => {
        createServer(createConnect({ 
          cwd: process.cwd(),
          output, 
          docs: normalizeDocs(docs),
          transform,
        })).listen({ port }, () => _resolve({ port }))
      })
    })
    .then(({ port }: any) => {
      console.log(`Local server is running on http://localhost:${port}${BASE_URL}`);
    })
}

function normalizeDocs(docs?: Docs): NormalDocs {
  if (!docs) return []
  if (typeof docs === 'string') docs = [docs]
  if (!Array.isArray(docs) && isObjectLike(docs)) docs = values(mapValues(docs, (item, name) => {
    if (typeof item === 'string') return { name, path: item }
    return { name, ...item }
  }))
  return (docs as Doc[]).map((item, i) => {
    const name = `doc-${i}`
    const output = name => `openapi-codegen/${name}`
    if (typeof item === 'string') {
      return { 
        path: item, 
        name, 
        output: output(name)
      }
    }
    return {
      name,
      output: output(item.name || name),
      ...item,
    }
  })
}


main({ 
  // 输出文件不会在该目录之外
  output: resolve(process.cwd(), 'temp'),
  docs: {
    v2: 'https://192.168.8.186/gateway/gpx-document/doc.html#/home',
    v3: 'http://192.168.8.186:8080/gpx-ruoyi-flex/swagger-ui/index.html?urls.primaryName=6.%E8%84%9A%E6%9C%AC%E7%94%9F%E6%88%90%E6%A8%A1%E5%9D%97#/'
  }
})






