import type { UnpluginFactory, UnpluginInstance } from 'unplugin'
import { createUnplugin } from 'unplugin'
import { main } from '@zdmin/ara-local-server'
import type { Options as AraLocalServerOptions } from '@zdmin/ara-local-server'

export interface Options extends AraLocalServerOptions {
  // define your plugin options here
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

export const unplugin: UnpluginInstance<Options | undefined> = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin