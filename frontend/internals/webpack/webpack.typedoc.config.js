const { resolve } = require('path');
const TypedocWebpackPlugin = require('typedoc-webpack-plugin');

module.exports = {
  mode: 'development',
  context: resolve(__dirname, '../../components'),
  output: {
    path: resolve(__dirname, '../../docs')
  },
  module: {
    rules: [
      { test: /\.ts$/, loader: 'ts-loader' },
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx'],
  },
  plugins: [
    new TypedocWebpackPlugin({
      out: '../docs',
      mode: 'file',
      name: '3D Repo Frontend',
      target: 'es6',
      ignoreCompilerErrors: true,
      exclude: '**/node_modules/**/*.*',
      excludeExternals: true,
      disableOutputCheck: true,
      tsconfig: './tsconfig.json',
      verbose: false
    }, ['./components'])
  ],
  //stats: 'none'
};
