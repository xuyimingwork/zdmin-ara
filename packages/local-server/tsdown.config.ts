import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: 'src/app.ts',
  alias: {
    '@': './src'
  }
})
