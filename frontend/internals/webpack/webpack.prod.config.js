const getWebpackConfig = require('./webpack.common.config');

module.exports = getWebpackConfig({
  mode: 'production',
  output: {
    filename: 'three_d_repo.min.js'
  }
});