const path = require('path')

module.exports = {
  entry: {
    realtime: './src/realtime_.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist/js'),
    filename: '[name].js'
  }
}