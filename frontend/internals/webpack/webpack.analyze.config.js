const getWebpackConfig = require('./webpack.common.config');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = getWebpackConfig({
  mode: 'production',
  plugins: [
    new BundleAnalyzerPlugin()
  ]
});