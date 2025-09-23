import connect from 'connect';
import { createServer } from 'http';
import cors from 'cors'
import bodyParser from 'body-parser'
import ConnectRest from 'connect-rest';
import getPort, { portNumbers } from 'get-port';
import { UserOptions, UserOptionsNormalized } from '@/types';
import { normalizeOptions } from '@/options/normalize';
import { createError, createResponse } from '@/utils/server';
import { getProject } from '@/api/project';
import { outputOpenAPI } from '@/api/openapi';

const BASE_PORT = 9125
const BASE_URL = '/openapi-codegen'

function createRest(options: UserOptionsNormalized) {
  const rest = ConnectRest.create({
    context: BASE_URL,
    logger: { level: 'error' }
  })

  // 接收 openapi 对象，生成相关文档
  rest.post('/openapi', (request, content) => {
    console.log('request to openapi')
    if (!content?.data) return createError('No OpenAPI Doc Content');
    // TODO: 允许无配置输出
    if (!content?.name) return createError('No OpenAPI Doc Name');
    const doc = options.doc.find(item => item.name === content.name)
    if (!doc) return createError('OpenAPI Doc Not Config')
    return outputOpenAPI({ openapi: content.data, doc, transform: options.transform })
      .then(({ files, statistic: { functions: count } }) => createResponse({ count, files }))
      .catch(err => createError(err.message));
  })

  rest.get('/project', () => createResponse(getProject(options), 'OpenAPI CodeGen Local Server is running'))
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

/**
 * 外部项目需要配置些什么东西？
 * 需要配置 root 吗？如果都不配置可以用吗？
 * 0 config
 * cwd 表示当前项目位置，主要用于区分不同项目
 */
export function main(options: UserOptions = {}) {
  return getPort({ port: portNumbers(BASE_PORT, BASE_PORT + 99) })
    .then(port => {
      return new Promise((_resolve) => {
        createServer(createConnect(normalizeOptions(options)).listen({ port }, () => _resolve({ port })))
      })
    })
}
