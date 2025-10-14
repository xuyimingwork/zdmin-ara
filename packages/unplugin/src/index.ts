import type { UnpluginFactory, UnpluginInstance } from 'unplugin'
import { createUnplugin } from 'unplugin'
import { createServer } from '@zdmin/ara-local-server'
import type { UserOptions as AraLocalServerOptions } from '@zdmin/ara-local-server'
import { bold, cyan, dim, green, yellow } from 'kolorist'

export interface Options extends AraLocalServerOptions {
  // define your plugin options here
}

const current: {
  p: Promise<any>
  server: { 
    port: number
    close: () => Promise<void> 
  } | null
} = {
  p: Promise.resolve(),
  server: null
}
function next(cb: () => any) {
  return current.p = current.p.then(() => cb())
}

export const unpluginFactory: UnpluginFactory<Options | undefined> = (options?: Options) => {
  return {
    name: 'unplugin-zdmin-ara',
    vite: {
      configureServer(server) {
        const _restart = server.restart
        server.restart = (...args) => {
          if (current.server) next(() => current.server!.close())
          return _restart(...args)
        }
        const _printUrls = server.printUrls
        const colorUrl = (url: string) => cyan(url.replace(/:(\d+)\//, (_, port) => `:${bold(port)}/`))
        server.printUrls = () => {
          _printUrls()
          console.log(`  ${green('➜')}  ${bold('Zdmin Ara')}: ${colorUrl(`http://localhost:${current.server?.port}/openapi-codegen`)}`)
        }
        return next(() => createServer(options).then(({ port, close }: any) => {
          current.server = { close, port }
        }))
      },
    },
    webpack() {

    }
  }
}

export type * from '@zdmin/ara-local-server'
export { createTransformBuilder, TypeRef, normalizeApiPath } from '@zdmin/ara-local-server'
export const unplugin: UnpluginInstance<Options | undefined> = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin