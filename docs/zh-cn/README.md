# @zdmin/ara [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/zdminjs/ara)

简体中文 | [English](../../README.md)

**请求代码秒级生成**

![TS/JS Code Gen](../images/screenshot-generate-code.png)

- 支持 **​​TypeScript / JavaScript** 
- 支持 **完整类型提示**（TypeScript / JavaScript 均支持）
- 支持 **Swagger 2.0 / OpenAPI 3.0**
- **Chrome 浏览器插件** 提供UI与预览
- 支持 **​​Vite / Webpack** （兼容 Vite 2.x / Webpack 3.x）
- 支持 **Node 14+**

## usage

### 1. 项目配置

安装依赖: `pnpm install -D @zdmin/ara-unplugin`

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

- 更多配置，请见：[@zdmin/ara-unplugin](../../packages/unplugin/README.md)

- Examples: 
  - [vite example](../../examples/vite)
  - [webpack example](../../examples/webpack)

> 对于其他客户端（Go、Java等）代码生成，可以参考 [local-server](../../packages/local-server/) 自行实现

### 2. 下载并安装 Chrome 浏览器插件

<details>

<summary>为什么使用浏览器插件？</summary>

由于 opanapi 文档通常需要鉴权步骤，我们使用浏览器插件复用鉴权流程。

</details>

- 🚀 [Chrome 应用商店](https://chromewebstore.google.com/detail/openapi-codegen/fjncpcopojccenmapbhicjcgeiabojli)

- 如果 Chrome 应用商店的版本不是最新的，你还可以： 
  1. 手动 [下载](https://cdn.jsdelivr.net/npm/@zdmin/ara-chrome-extension) 并解压
  2. [加载未打包的](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked) Chrome 浏览器插件

### 3. 预览 & 生成

- 打开浏览器开发者工具
- 访问 OpenAPI 文档页面
- 预览并生成代码

![预览并生成代码](../images/screenshot-preview.png))

