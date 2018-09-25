const {resolve} = require('path');

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
              name(file) {
                if (options.mode === 'development') {
                  return '[path][name].[ext]'
                }

                return '[hash].[ext]'
              }
            }
          }]
        }
      ]
    },
    plugins: [...(options.plugins || [])]
  }

  return config;
};
