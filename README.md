# @zdmin/ara

**TS/JS Code Generate is Ready Now!**

This project contains a set of tools for generating client api request code from OpenAPI specification.

## usage

### download & install chrome extension

- 🚀 [Chrome Web Store](https://chromewebstore.google.com/detail/openapi-codegen/fjncpcopojccenmapbhicjcgeiabojli)

- **OR** if Chrome Web Store not latest, you can: 
  1. [download](https://cdn.jsdelivr.net/npm/@zdmin/ara-chrome-extension) manually and unzip it.
   2. [load-unpacked](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked) chrome extension.

> About chrome extension version: 
> - alpha: `1.0.0-alpha.8` will be `1.0.0.108`
> - beta: `1.0.0-beta.8` will be `1.0.0.208`

### for js/ts project: setup plugin

- install: `pnpm install -D @zdmin/ara-unplugin`
- setup: in progress

> reference: 
> - [vite example](./examples/vite)
> - [webpack example](./examples/webpack)



### for other client project

build your own server like [local-server](./packages/local-server/)

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

