import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: 'src/run.ts',
  outDir: 'dist-dev',
  alias: {
    '@': './src'
  }
})
