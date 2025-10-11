# @zdmin/ara

This project provide a set of tools to generate client api request code from OpenAPI specification.

## usage

### download & install chrome extension

- [download](https://cdn.jsdelivr.net/npm/@zdmin/ara-chrome-extension)
- unzip download file and [load-unpacked](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked) chrome extension.

### setup plugin in project

- install: `pnpm install -D @zdmin/ara-unplugin`
- setup: still in progress, you can check my [vite example](./examples/vite) first.

## build

- version: update `package.json`'s `version` and then run `pnpm run version`
- publish: run `pnpm publish -r`

## next

- [ ] prepare docs

---

- [x] generate type file based on function files
- [ ] changing local server to use express? or use express.router to drop connect-rest
- [ ] setup test, first for normalizeImports

---

- [x] change repo to monorepo
- [x] redesign backend api
- [x] change frontend ui to project base

