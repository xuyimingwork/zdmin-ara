# @zdmin/ara [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/zdminjs/ara)

English | [简体中文](./docs/zh-cn/README.md)

**Generate Request Code from OpenAPI specs in seconds**

![TS/JS Code Gen](./docs/images/screenshot-generate-code.png)

- **​​TypeScript / JavaScript** Code Supported
- **Type Safety​​** for **Both** TypeScript / JavaScript (by JSDoc)
- **Swagger 2.0 / OpenAPI 3.0** specs Supported
- **Chrome Extension** for UI & Preview
- **​​Vite / Webpack** Supported (Compat with Vite 2.x / Webpack 3.x)
- **Node 14+** Supported

## usage

### 1. Setup Project

install: `pnpm install -D @zdmin/ara-unplugin`

<details open>

<summary>Vite</summary>

```js
import { defineConfig } from 'vite'
import Ara from '@zdmin/ara-unplugin/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    Ara({
      doc: 'https://petstore.swagger.io/'
    }),
    // ...
  ],
  // ...
})
```

</details>

<details>

<summary>Webpack</summary>

```js
import Ara from '@zdmin/ara-unplugin/webpack'
// const Ara = require('@zdmin/ara-unplugin/webpack')

export default {
  plugins: [
    Ara({
      doc: 'https://petstore.swagger.io/'
    }),
    // ...
  ],
  // ...
};
```

</details>

- More Options: [@zdmin/ara-unplugin](./packages/unplugin/README.md)

- Examples: 
  - [vite example](./examples/vite)
  - [webpack example](./examples/webpack)

> for other client project: build your own server like [local-server](./packages/local-server/)

### 2. Download & Install Chrome Extension

<details>

<summary>Why use Chrome Extension?</summary>

Since openapi docs behind some auth in common, we use Chrome Extension for getting openapi docs data seamlessly.

</details>

- 🚀 [Chrome Web Store](https://chromewebstore.google.com/detail/openapi-codegen/fjncpcopojccenmapbhicjcgeiabojli)

- **OR** if Chrome Web Store not latest, you can: 
  1. [download](https://cdn.jsdelivr.net/npm/@zdmin/ara-chrome-extension) manually and unzip it.
  2. [load-unpacked](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked) chrome extension.

### 3. Preview & Generate

- Open Chrome DevTools
- Visit OpenAPI doc page
- Preview & Generate Code

![Preview & Generate Code in Chrome DevTools](./docs/images/screenshot-preview.png)

