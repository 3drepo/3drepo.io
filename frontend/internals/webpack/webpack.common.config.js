const {resolve} = require('path');

module.exports = (options) => {
  const config = {
    mode: options.mode || 'development',
    context: resolve(__dirname, '../../'),
    entry: {
      vendors: ['react', 'react-dom'],
      'three_d_repo': options.entry || './main.ts'
    },
    output: Object.assign({
      path: resolve(__dirname, '../../../public/dist/'),
      filename: '[name].min.js'
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
        }
      ]
    }
  };

  return config;
};
