const getWebpackConfig = require('./webpack.common.config');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MODES = require('./tools/modes');

module.exports = getWebpackConfig({
  mode: MODES.PRODUCTION,
  entry: {
    unity: './globals/unity-util-external.ts'
  },
  output: {
    filename: ({ chunk: { name }}) => {
      if (name === 'main') {
        return 'three_d_repo.min.js';
      }
      if (name === 'support') {
        return 'support.min.js';
      }
      
      return '../unity/unity-util.js';
    }
  },
  plugins: [
    new CopyWebpackPlugin([{ from: 'custom/**', to: '../' }])
  ],
  stats: 'errors-only'
});
