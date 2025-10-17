import { fileURLToPath } from 'node:url'
import { defineConfig } from 'tsdown'

export default defineConfig({
  tsconfig: fileURLToPath(new URL('./tsconfig.json', import.meta.url)),
  entry: ['./src/*.ts'],
  exports: true,
  shims: true,
  format: ['cjs', 'es'],
  target: ['node14'],
  noExternal: ['unplugin'],
  alias: {
    '@': './src',
    '~': '.',
  }
})