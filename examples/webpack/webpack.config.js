import { fileURLToPath, URL } from 'node:url'
import Ara from '@zdmin/ara-unplugin/webpack'

export default {
  mode: 'development', // Set mode to development
  entry: './src/index.js', // Your entry point
  output: {
    filename: 'bundle.js', // Output bundle file name
    path: fileURLToPath(new URL('./dist', import.meta.url)), // Output directory
  },
  devServer: {
    static: fileURLToPath(new URL('./dist', import.meta.url)), // Serve static files from 'dist'
    port: 8080, // Port for the dev server
    open: true, // Open browser automatically
    hot: true, // Enable Hot Module Replacement (HMR)
  },
  plugins: [
    Ara({
      doc: 'https://petstore.swagger.io/'
    })
  ]
};