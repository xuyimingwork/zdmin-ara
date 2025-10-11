import { readFile } from "node:fs/promises"
import { basename, resolve } from "node:path"
import type { PluginOption, ResolvedConfig } from "vite"
import { zip } from 'zip-a-folder'

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
      readFile(pkg, 'utf-8')
        .then(content => JSON.parse(content))
        .then(content => zip(dist, basename(content.name) + '.zip'))
    }
  }
}