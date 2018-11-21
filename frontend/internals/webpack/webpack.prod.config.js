const getWebpackConfig = require('./webpack.common.config');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MODES = require('./tools/modes');

module.exports = getWebpackConfig({
  mode: MODES.PRODUCTION,
  output: {
    filename: 'three_d_repo.min.js'
  },
  plugins: [
    new CopyWebpackPlugin([{ from: 'custom/**', to: '../' }])
  ],
  stats: 'errors-only'
});