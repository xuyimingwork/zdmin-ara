import connect from 'connect';
import { createServer } from 'http';
import cors from 'cors'
import bodyParser from 'body-parser'
import ConnectRest from 'connect-rest';
import { rmdir, writeFile } from 'fs/promises';
import { transform } from '@/transform';
import { mkdirp } from 'mkdirp';
import { resolve } from 'path';

function createRest({ root = process.cwd() } = {}) {
  const rest = ConnectRest.create({
    context: '/openapi-codegen',
  })

  /**
   * 后端服务接口需要仔细设计
   * - 1 个服务可以对应 n 个项目（项目可以用本地路径区分）
   * - 1 个项目可以对应 n 个 OpenAPI 文档（使用文档路径？）
   */

  rest.post('/openapi', (request, content) => {
    console.log('request to openapi')
    if (!content?.data) return Promise.reject(new Error('Invalid content'));
    return rmdir(root, { recursive: true }).then(() => Promise.all([
      ...transform({ openapi: content.data }), 
      { file: 'openapi.json', content: JSON.stringify(content.data, undefined, 2) }
    ].map(({ file, content }) => {
      const path = resolve(root, file.startsWith('/') ? file.slice(1) : file);
      const dir = path.slice(0, path.lastIndexOf('/'))
      return mkdirp(dir).then(() => writeFile(path, content, 'utf8'))
    })))
      .then(res => ({ ok: true }))
      .catch(err => ({ ok: false, message: err.message }));
  })

  rest.get('/project', (request, content) => {
    return Promise.resolve({ 
      ok: true, 
      message: 'OpenAPI CodeGen Local Server is running',
      data: {
        path: root
      }
    });
  })

  return rest
}

function createConnect({ root = process.cwd() } = {}) {
  const app = connect();
  app.use( bodyParser.urlencoded( { extended: true, limit: '50mb' } ) )
  app.use( bodyParser.json({ limit: '50mb' }) )
  app.use(cors())
  app.use(createRest({ root }).processRequest());
  return app;
}

createServer(createConnect({ root: resolve(process.cwd(), 'temp') })).listen({ port: 9125 }, () => {
  console.log('Local server is running on http://localhost:9125/openapi-codegen');
})



