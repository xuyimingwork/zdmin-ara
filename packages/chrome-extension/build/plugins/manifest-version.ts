import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { PluginOption, ResolvedConfig } from "vite";
import { version } from '../../package.json'

const GREEK_MAP = { alpha: 100, beta: 200 } as const
const PLACEHOLDERS = { __MANIFEST_VERSION__: getManifestVersion() }

function getManifestVersion(): string {
  return version.includes('-') 
    // chrome version only support at most four parts & all parts need be int
    ? [version.split('-')[0], version.split('-')[1].split('.').reduce((v, part, i) => {
      if (i === 0 && part in GREEK_MAP) return v + GREEK_MAP[part as keyof typeof GREEK_MAP]
      else if (i === 0) throw Error(`manifest-version: unknown release phase ${part}`)
      return v + Number.parseInt(part)
    }, 0)].join('.')
    // 1.0.0.999 is final release of 1.0.0
    : version + '.999'
}

function updateManifest(from: string, target: string) {
  return readFile(from, 'utf-8')
    .then(content => {
      if (Object.keys(PLACEHOLDERS).every(key => !content.includes(key))) return
      content = Object.keys(PLACEHOLDERS).reduce((content, key) => {
        return content.replace(key, PLACEHOLDERS[key as keyof typeof PLACEHOLDERS])
      }, content)
      return writeFile(target, content, 'utf-8')
    })
    .catch(e => {
      console.error('manifest-version: update manifest failed', e)
      throw e
    })
}

export function ManifestVersion(): PluginOption {
  let config: ResolvedConfig
  const syncManifest = () => updateManifest(
    resolve(config.root, 'public', 'manifest.json'),
    resolve(config.root, config.build.outDir, 'manifest.json')
  )
  return {
    name: 'manifest-version',
    configResolved(_config) {
      config = _config
    },
    renderStart() {
      return syncManifest()
    },
    buildStart() {
      return syncManifest()
    },
  }
}