const {resolve} = require('path');

module.exports = (options) => {
  const config = {
    mode: options.mode || 'development',
    context: resolve(process.cwd(), '../'),
    entry: options.entry || './main.ts',
    output: Object.assign({
      path: __dirname + './../../../public/dist/',
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
        }
      ]
    }
  };

  return config;
};
