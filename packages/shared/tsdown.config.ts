import { fileURLToPath } from 'node:url'
import { defineConfig } from 'tsdown'

export default defineConfig({
  tsconfig: fileURLToPath(new URL('./tsconfig.json', import.meta.url)),
  entry: ['src/index.ts'],
  exports: true,
  shims: true,
  format: ['cjs', 'es'],
  target: ['node14', 'es6'],
  alias: {
    '@': './src',
    '~': '.',
  }
})