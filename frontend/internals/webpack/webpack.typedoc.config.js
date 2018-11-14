const { resolve } = require('path');
const getWebpackConfig = require('./webpack.common.config');
const TypedocWebpackPlugin = require('typedoc-webpack-plugin');

module.exports = getWebpackConfig({
  output: {
    path: resolve(__dirname, '../../../docs')
  },
  plugins: [
    new TypedocWebpackPlugin({
      out: '../docs',
      name: '3D Repo Frontend',
      mode: 'file',
      target: 'es6',
      includeDeclarations: false,
      ignoreCompilerErrors: true
    }, ['./components'])
  ]
});
