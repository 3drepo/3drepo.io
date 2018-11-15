const getWebpackConfig = require('./webpack.common.config');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = getWebpackConfig({
  mode: 'production',
  output: {
    filename: 'three_d_repo.min.js'
  },
  plugins: [
    new CopyWebpackPlugin([{ from: 'custom/**', to: '../' }])
  ]
});