import type { UnpluginFactory, UnpluginInstance } from 'unplugin'
import { createUnplugin } from 'unplugin'
import { main } from '@zdmin/ara-local-server'
import type { UserOptions as AraLocalServerOptions } from '@zdmin/ara-local-server'

export interface Options extends AraLocalServerOptions {
  // define your plugin options here
}

function getServer(options: Options) {

}

export const unpluginFactory: UnpluginFactory<Options | undefined> = (options?: Options) => {
  console.log('hello unplugin')
  return {
    name: 'unplugin-zdmin-ara',
    vite: {
      configureServer() {
        main(options).then(({ port }: any) => {
          console.log('app is running at', port)
        })
      }
    },
    webpack() {

    }
  }
}

export type * from '@zdmin/ara-local-server'
export { createTransformBuilder, TypeRef, normalizeApiPath } from '@zdmin/ara-local-server'
export const unplugin: UnpluginInstance<Options | undefined> = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin