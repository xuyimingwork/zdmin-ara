import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: 'src/app.ts',
  exports: true,
  shims: true,
  external: ['typescript'],
  // buildin get-port to support node14
  noExternal: ['get-port'],
  format: ['cjs', 'es'],
  target: ['node14'],
  alias: {
    '@': './src',
    '~': '.',
  }
})
