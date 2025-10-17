import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: 'src/app.ts',
  exports: true,
  shims: true,
  external: ['typescript'],
  format: ['cjs', 'es'],
  target: ['node14'],
  alias: {
    '@': './src',
    '~': '.',
  }
})
