import "core-js/stable"
import connect from 'connect';
import { createServer as createHTTPServer } from 'http';
import cors from 'cors'
import bodyParser from 'body-parser'
import ConnectRest from 'connect-rest';
import getPort, { portNumbers, clearLockedPorts } from 'get-port';
import { normalizeOptions } from '@/options/normalize';
import { createError, createResponse } from '@/utils/server';
import { getProject } from '@/api/project';
import { outputOpenAPI, previewOpenAPI } from '@/api/openapi';
import type { UserOptions, UserOptionsNormalized } from '@/types/option';
import type * as net from 'node:net'
import { Server } from 'node:http';

const BASE_PORT = 9125
const BASE_URL = '/openapi-codegen'

function createRest(options: UserOptionsNormalized) {
  const rest = ConnectRest.create({
    context: BASE_URL,
    logger: { level: 'error' }
  })

  const apiGetProject = () => createResponse(getProject(options), 'OpenAPI CodeGen Local Server is running, Open Chrome DevTools to start.')

  // TODO: 提供可视化页面
  rest.get({ path: BASE_URL.substring(1), context: '/' }, apiGetProject)

  // 接收 openapi 对象，生成相关文档
  rest.post('/openapi', (request, content) => {
    if (!content?.data) return createError('No OpenAPI Doc Content');
    // TODO: 允许无配置输出
    const doc = !content?.name 
      ? options.doc.find(item => !item.name) 
      : options.doc.find(item => item.name === content.name)
    if (!doc) return createError('OpenAPI Doc Not Config')
    const preview = !!content.preview
    return (preview ? previewOpenAPI : outputOpenAPI)({ 
      openapi: content.data, 
      doc, 
      transform: options.transform,
      banner: options.banner,
      typeGettersModule: options.typeGettersModule
    })
      .then(({ files, statistic }) => createResponse({ statistic, files }))
      .catch(err => createError(err.message));
  })

  // 获取项目信息
  rest.get('/project', apiGetProject)
  return rest
}

function createConnect(options: UserOptionsNormalized) {
  const app = connect();
  app.use( bodyParser.urlencoded( { extended: true, limit: '50mb' } ) )
  app.use( bodyParser.json({ limit: '50mb' }) )
  app.use(cors())
  app.use(createRest(options).processRequest());
  return app;
}

export function createServerCloseFn(
  server: Server | null,
): () => Promise<void> {
  if (!server) {
    return () => Promise.resolve()
  }

  let hasListened = false
  const sockets = new Set<net.Socket>()

  server.on('connection', (socket) => {
    sockets.add(socket)
    socket.on('close', () => sockets.delete(socket))
  })

  server.once('listening', () => hasListened = true)

  return () =>
    new Promise<void>((resolve, reject) => {
      sockets.forEach((s) => s.destroy())
      if (hasListened) {
        server.close((err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      } else {
        resolve()
      }
    })
}

export async function createServer(options: UserOptions = {}) {
  clearLockedPorts()
  const port = await getPort({ port: portNumbers(BASE_PORT, BASE_PORT + 99) })
  const server = createHTTPServer(createConnect(normalizeOptions(options)))
  const close = createServerCloseFn(server)
  return new Promise((_resolve) => {
    server.listen({ port }, () => _resolve({ 
      close, port
    }))
  })
}

export { createTransformBuilder } from '@/transform/transformer/builder'

export type { 
  GetResponse, 
  GetRequestOptions,
  GetRequestQuery,
  GetRequestBody,
  GetRequestParams,
} from '@/types/openapi'

export type { 
  UserOptions,
  UserApiTransformer
} from '@/types/option'

export { 
  TypeRef
} from '@/transform/type'

export {
  normalizePath as normalizeApiPath
} from '@/utils/restful'

export {
  getBanner as createDefaultBanner
} from '@/utils/banner'
