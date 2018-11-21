const getWebpackConfig = require('./webpack.common.config');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MODES = require('./tools/modes');

module.exports = getWebpackConfig({
  mode: MODES.PRODUCTION,
  plugins: [
    new BundleAnalyzerPlugin()
  ]
});