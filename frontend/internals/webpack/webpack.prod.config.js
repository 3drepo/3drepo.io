const getWebpackConfig = require('./webpack.common.config');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MODES = require('./tools/modes');

module.exports = getWebpackConfig({
  mode: MODES.PRODUCTION,
  entry: {main:'./main.ts', unity: './globals/unity-util.ts'},
  output: {
    filename: chunkData => chunkData.chunk.name == 'main'? 'three_d_repo.min.js' : '../unity/unity-util.js'
  },
  plugins: [
    new CopyWebpackPlugin([{ from: 'custom/**', to: '../' }])
  ],
  stats: 'errors-only'
});