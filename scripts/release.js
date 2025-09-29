import { readdir, readFile, writeFile } from 'fs/promises'
import root from '../package.json' with { type: 'json' }
import { fileURLToPath } from 'url'
import { resolve } from 'path'

function change(pkg) {
  return readFile(pkg, 'utf-8')
    .then(content => {
      return writeFile(pkg, JSON.stringify({
        ...JSON.parse(content),
        version: root.version
      }, undefined, 2), 'utf-8')
    })
}

function main() {
  const packages = fileURLToPath(new URL('../packages', import.meta.url))
  return readdir(packages)
    .then(dirs => {
      return Promise.allSettled(dirs.map(dir => resolve(packages, dir, 'package.json')).map(pkg => change(pkg)))
    })
}

main()