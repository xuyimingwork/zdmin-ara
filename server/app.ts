import connect from 'connect';
import { createServer } from 'http';
import cors from 'cors'
import bodyParser from 'body-parser'
import ConnectRest from 'connect-rest';
import { writeFile } from 'fs/promises';

const app = connect();

app.use( bodyParser.urlencoded( { extended: true } ) )
app.use( bodyParser.json() )
app.use(cors())

const rest = ConnectRest.create({
  context: '/openapi-codegen',
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any

rest.post('/files', (request, content) => {
  if (!Array.isArray(content)) return Promise.reject(new Error('Invalid content type, expected an array of files.'));
  console.log('Received files:', content);
  return Promise.all(content.map(({ content }, i) => {
    if (typeof content !== 'string') {
      return Promise.reject(new Error('Invalid file content, expected a string.'));
    }
    
    return writeFile(`./${Date.now()}-${i}.json`, content, 'utf8')
  })).then(res => ({ ok: true }))
})

app.use(rest.processRequest());

createServer(app).listen(9125)

