import { access, readdir, readFile, writeFile } from 'fs/promises'
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
    .then(dirs => dirs.map(dir => resolve(packages, dir, 'package.json')))
    .then(pkgs => Promise.allSettled(pkgs.map(pkg => access(pkg).then(() => pkg)))
      .then(result => result.filter(item => item.status === 'fulfilled').map(item => item.value)))
    .then(pkgs => Promise.allSettled(pkgs.map(pkg => change(pkg).then(() => pkg))))
    .then(result => {
      console.log(result.map(item => item.value).join('\n'), '\n\n new version', root.version)
    })
}

main()