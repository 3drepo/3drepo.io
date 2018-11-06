const getWebpackConfig = require('./webpack.common.config');

module.exports = getWebpackConfig({
  mode: 'development',
  devtool: 'inline-source-map',
});
