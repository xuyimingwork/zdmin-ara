# @zdmin/ara-unplugin

## Install

`pnpm install -D @zdmin/ara-unplugin`

## Usage

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

## Options

### cwd

- Type: `string`
- Default: `process.cwd()`

Project root directory.

### outDir

- Type: `string`
- Default: `openapi-codegen`

Specify the output directory (relative to [project root](#cwd)).

### doc

Specify OpenAPI doc url.

```js
// only one doc
Ara({
  doc: 'https://petstore.swagger.io/'
})
```

```js
// multi docs
// object config
Ara({
  doc: {
    pet: 'https://petstore.swagger.io/',
    'pet-v3': {
      url: 'https://petstore3.swagger.io/',
      outDir: 'pet-v3' // config the output directory for doc (relative to [outDir](#outDir)
    }
  }
})

// or using array
Ara({
  doc: [
    {
      name: 'pet',
      url: 'https://petstore.swagger.io/'
    },
    {
      name: 'pet-v3',
      url: 'https://petstore3.swagger.io/',
      outDir: 'pet-v3' // config the output directory for doc (relative to [outDir](#outDir)
    }
  ]
})
```

### transform

Specify how api transform to code.

```js
Ara({
  transform({ method, path }) {
    return {
      // config generated function name based on http method & path
      name: method + path.substring(path.lastIndexOf('/') + 1)
    }
  }
})
```

see `UserApiTransformer` in [option.d.ts](../local-server/src/types/option.d.ts)

#### transform input

| name    | description                 |
| ------- | --------------------------- |
| doc     | doc config for this api     |
| method  | api http method             |
| path    | api http path               |
| openapi | api's openapi data          |
| base    | api's base transform result |
| refs    | some ref info of this api   |

#### transform output

| name       | description                                    |
| ---------- | ---------------------------------------------- |
| ignore     | ignore this api                                |
| output     | file path of this api (relative to doc.outDir) |
| name       | function name                                  |
| parameters | function arguments data                        |
| code       | function body                                  |
| imports    | function dependencies                          |

see `ApiTransformerReturn` in [api.d.ts](../local-server/src/types/api.d.ts)
