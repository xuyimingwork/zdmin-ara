import { access, readdir, readFile, writeFile } from 'fs/promises'
import root from '../package.json' with { type: 'json' }
import { fileURLToPath } from 'url'
import { resolve } from 'path'

function version(pkg) {
  return readFile(pkg, 'utf-8')
    .then(content => {
      return writeFile(pkg, JSON.stringify({
        ...JSON.parse(content),
        version: root.version
      }, undefined, 2), 'utf-8')
    })
}

function main() {
  const rootDir = fileURLToPath(new URL('../packages', import.meta.url))
  return readdir(rootDir)
    .then(dirs => dirs.map(dir => resolve(rootDir, dir, 'package.json')))
    .then(pkgs => Promise.allSettled(pkgs.map(pkg => access(pkg).then(() => pkg))))
    .then(result => result.filter(item => item.status === 'fulfilled').map(item => item.value))
    .then(pkgs => Promise.allSettled(pkgs.map(pkg => version(pkg).then(() => pkg))))
    .then(result => {
      console.log(result.map(item => item.value).join('\n'), '\n\n new version', root.version)
    })
}

main()