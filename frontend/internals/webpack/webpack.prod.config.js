const getWebpackConfig = require('./webpack.common.config');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MODES = require('./tools/modes');

const outputNames = {
  main: 'three_d_repo.min.js',
  support: 'support.min.js',
  maintenance: 'maintenance.min.js',
  unity: '../unity/unity-util.js'
};

module.exports = getWebpackConfig({
  mode: MODES.PRODUCTION,
  entry: {
    unity: './src/globals/unity-util-external.ts'
  },
  output: {
    filename: ({ chunk: { name }}) => outputNames[name] || '[name].js'
  },
  plugins: [
    new CopyWebpackPlugin([{ from: 'custom/**', to: '../' }])
  ],
  stats: 'errors-only'
});