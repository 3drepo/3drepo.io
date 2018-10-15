const {resolve} = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (options) => {
  const config = {
    mode: options.mode || 'development',
    context: resolve(__dirname, '../../'),
    entry: options.entry || './main.ts',
    output: Object.assign({
      path: resolve(__dirname, '../../../public/dist/'),
      filename: 'three_d_repo.min.js'
    }, options.output),
    resolve: {
      extensions: ['.ts', '.js', '.tsx']
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          loader: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.(ts|tsx)$/,
          loader: 'lodash-ts-imports-loader',
          exclude: /node_modules/,
          enforce: 'pre'
        },
        {
          test: /\.(png|jpg|gif|svg)$/,
          use: [{
            loader: 'file-loader',
            options: {
              outputPath: '../images/',
              publicPath: 'images/',
              name(file) {
                if (options.mode === 'development') {
                  return '[name].[ext]'
                }

                return '[hash].[ext]'
              }
            }
          }]
        }
      ]
    },
    plugins: [...(options.plugins || [
      new CopyWebpackPlugin([
        { from: 'node_modules/zxcvbn/dist/zxcvbn.js' }
      ], options)
    ])]
  }

  return config;
};
