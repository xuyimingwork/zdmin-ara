import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: 'src/app.ts',
  external: ['typescript'],
  alias: {
    '@': './src',
    '~': '.',
  }
})
