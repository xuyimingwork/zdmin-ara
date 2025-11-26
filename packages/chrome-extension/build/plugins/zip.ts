import { readFile, writeFile } from "node:fs/promises"
import { basename, resolve } from "node:path"
import type { PluginOption, ResolvedConfig } from "vite"
import { zip as _zip } from 'zip-a-folder'

export function Zip(): PluginOption {
  let config: ResolvedConfig
  return {
    name: 'zip',
    configResolved(_config) {
      config = _config
    },
    closeBundle() {
      const dist = resolve(config.root, config.build.outDir)
      const pkg = resolve(config.root, 'package.json')
      const zip = (name: string) => _zip(dist, name).then(() => console.log('zip', name))
      const prepare = (source: string = '') => writeFile(resolve(dist, 'meta.json'), JSON.stringify({ source }))
      readFile(pkg, 'utf-8')
        .then(content => JSON.parse(content))
        .then(content => {
          return Promise.resolve()
            .then(() => prepare('npm').then(() => zip(basename(content.name) + '.zip')))
            .then(() => prepare('').then(() => zip(basename(content.name) + '-store.zip')))
        })
        .finally(() => prepare('un'))
    }
  }
}