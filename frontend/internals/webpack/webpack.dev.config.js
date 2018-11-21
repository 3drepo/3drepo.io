const getWebpackConfig = require('./webpack.common.config');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const MODES = require('./tools/modes');

const statsOptions = {
  assets: true,
  hash: false,
  timings: true,
  chunks: false,
  chunkModules: false,
  modules: false,
  depth: false,
  children: false,
  version: true,
  warnings: false,
  cached: false,
  cachedAssets: false,
  reasons: false,
  source: false,
  errorDetails: true,
  moduleTrace: true,
  performance: true
};

module.exports = getWebpackConfig({
  mode: MODES.DEVELOPMENT,
  devtool: 'inline-source-map',
  plugins: [
    new LiveReloadPlugin({
      hostname: 'localhost',
      port: '35729',
      start: true,
      quiet: false
    })
  ],
  performance: {
    hints: 'warnings'
  },
  stats: statsOptions
});
