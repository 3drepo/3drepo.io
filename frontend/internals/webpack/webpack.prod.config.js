const getWebpackConfig = require('./webpack.common.config');

module.exports = getWebpackConfig({
  mode: "production"
});