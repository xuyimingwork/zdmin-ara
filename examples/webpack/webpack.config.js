const path = require('node:path')
const Ara = require('@zdmin/ara-unplugin/webpack')

module.exports = {
  mode: 'development', // Set mode to development
  entry: './src/index.js', // Your entry point
  output: {
    filename: 'bundle.js', // Output bundle file name
    path: path.resolve(__dirname, './dist'), // Output directory
  },
  devServer: {
    // static: path.resolve(__dirname, './dist'), // Serve static files from 'dist'
    // port: 8080, // Port for the dev server
    // open: true, // Open browser automatically
    // hot: true, // Enable Hot Module Replacement (HMR)
  },
  plugins: [
    Ara({
      doc: 'https://petstore.swagger.io/'
    })
  ]
};