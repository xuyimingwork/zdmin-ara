import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { PluginOption, ResolvedConfig } from "vite";

const GREEK_MAP = { alpha: 100, beta: 200 } as const

function version(root: any, target: string) {
  const version: string = root.version 
  return readFile(target, 'utf-8')
    .then(content => {
      return writeFile(target, JSON.stringify({
        ...JSON.parse(content),
        version: version.includes('-') 
          // chrome version only support at most four parts & all parts need be int
          ? [version.split('-')[0], version.split('-')[1].split('.').reduce((v, part, i) => {
            if (i === 0 && part in GREEK_MAP) return v + GREEK_MAP[part as keyof typeof GREEK_MAP]
            else if (i === 0) throw Error(`manifest-version: unknown release phase ${part}`)
            return v + Number.parseInt(part)
          }, 0)].join('.')
          // 1.0.0.999 is final release of 1.0.0
          : version + '.999'
      }, undefined, 2), 'utf-8')
    })
}

export function ManifestVersion(): PluginOption {
  let config: ResolvedConfig
  return {
    name: 'manifest-version',
    configResolved(_config) {
      config = _config
    },
    buildStart() {
      const file = resolve(config.root, config.build.outDir, 'manifest.json')
      const pkg = resolve(config.root, 'package.json')
      return readFile(pkg, 'utf-8')
        .then(content => JSON.parse(content))
        .then(content => version(content, file))
    },
  }
}