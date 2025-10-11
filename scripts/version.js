import { access, readdir, readFile, writeFile } from 'fs/promises'
import root from '../package.json' with { type: 'json' }
import { fileURLToPath } from 'url'
import { resolve } from 'path'
import { simpleGit } from 'simple-git';

const git = simpleGit()

function version(pkg) {
  return readFile(pkg, 'utf-8')
    .then(raw => {
      const content = JSON.parse(raw)
      if (content.version === root.version) return
      return writeFile(pkg, JSON.stringify({
        ...content,
        version: root.version
      }, undefined, 2), 'utf-8')
    })
}

function sync() {
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

function main() {
  return prepare()
    .then(() => sync())
    .then(() => commit())
    .catch(e => {
      console.log('STOP:', e.message || e)
    })
}

function prepare() {
  return git.status()
    .then(({ isClean, staged }) => {
      if (staged.length) throw Error('Not clear staged content.')
      return isClean()
    })
    .then(clean => {
      // TODO: 缺少外部 package 已更改，内部为更改场景，仅做同步？
      if (clean) throw Error('No version change.')
      return git.diffSummary()
    })
    .then(diff => {
      if ([diff.changed,  diff.deletions, diff.insertions].some(item => item !== 1)) throw Error('Not only package.json change.')
      if (diff.files.length !== 1 || diff.files[0].file !== 'package.json') throw Error('No package.json change.')
      if (diff.files[0].changes !== 2 || diff.files[0].insertions !== 1 || diff.files[0].deletions !== 1) throw Error('Not only package.json version change.')
      return git.diff()
    })
    .then(diff => {
      const regex = /-  "version":.+\n\+  "version":.+\n/
      if (!regex.test(diff)) throw Error('No package.json version change.')
    })
}

function commit() {
  return git.add('*')
    .commit(`version: v${root.version}`)
    .addTag(`v${root.version}`)
    .then(() => console.log('commit done.'))
}

main()