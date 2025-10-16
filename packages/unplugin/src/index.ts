import type { UnpluginFactory, UnpluginInstance } from 'unplugin'
import { createUnplugin } from 'unplugin'
import { createServer } from '@zdmin/ara-local-server'
import type { UserOptions as AraLocalServerOptions } from '@zdmin/ara-local-server'
import { bold, cyan, yellow, green } from 'kolorist'
import { camelCase, upperFirst } from 'es-toolkit'

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
const colorUrl = (url: string) => cyan(url.replace(/:(\d+)\//, (_, port) => `:${bold(port)}/`))
const hint = (port?: string | number) => `${green(`Open ${colorUrl(`http://localhost${port ? `:${port}` : ''}/openapi-codegen`)} in Chrome then Open Chrome DevTools to use`)}`

export const unpluginFactory: UnpluginFactory<Options | undefined> = (options?: Options) => {
  const name = 'unplugin-zdmin-ara'
  return {
    name,
    vite: {
      configureServer(server) {
        const _restart = server.restart
        server.restart = (...args) => {
          if (current.server) next(() => current.server!.close())
          return _restart(...args)
        }
        const _printUrls = server.printUrls
        server.printUrls = () => {
          _printUrls()
          console.log(`  ${yellow('➜')}  ${bold('Zdmin Ara')}: ${hint(current.server?.port)}`)
        }
        return next(() => createServer(options).then(({ port, close }: any) => {
          current.server = { close, port }
        }))
      },
    },
    webpack(compiler) {
      const PLUGIN_NAME = upperFirst(camelCase(name))
      const start = () => {
        next(() => createServer(options).then(({ port, close }: any) => {
          current.server = { close, port }
          console.log(`<i> ${bold(green(`[${name}]`))} ${bold(hint(port))}`)
        }))
      }
      const end = () => {
        if (current.server) next(() => current.server!.close())
      }
      // webpack 4 & 5 support
      if (compiler.hooks) {
        compiler.hooks.watchRun.tap(PLUGIN_NAME, start)
        compiler.hooks.watchClose.tap(PLUGIN_NAME, end)
        return
      }
      // webpack 3 support
      ;(compiler as any).plugin('watch-run', start)
      ;(compiler as any).plugin('watch-close', end)
    }
  }
}

export type * from '@zdmin/ara-local-server'
export { createTransformBuilder, TypeRef, normalizeApiPath } from '@zdmin/ara-local-server'
export const unplugin: UnpluginInstance<Options | undefined> = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin