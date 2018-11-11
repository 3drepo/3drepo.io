const getWebpackConfig = require('./webpack.common.config');
const LiveReloadPlugin = require('webpack-livereload-plugin');

module.exports = getWebpackConfig({
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [
    new LiveReloadPlugin({
      hostname: 'localhost',
      port: '35729',
      start: true,
      quiet: false
    })
  ]
});
