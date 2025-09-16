import type { UnpluginFactory, UnpluginInstance } from 'unplugin'
import { createUnplugin } from 'unplugin'

export interface Options {
  // define your plugin options here
}

export const unpluginFactory: UnpluginFactory<Options | undefined> = (options?: Options) => ({
  name: 'unplugin-zdmin-ara',
})

export const unplugin: UnpluginInstance<Options | undefined> = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin