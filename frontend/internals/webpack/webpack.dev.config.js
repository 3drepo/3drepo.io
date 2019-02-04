const LiveReloadPlugin = require('webpack-livereload-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin')
const getWebpackConfig = require('./webpack.common.config');
const MODES = require('./tools/modes');
const PATHS = require('./tools/paths');

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
    new CleanWebpackPlugin([`${PATHS.DIST_DIR}/three_d_repo.*.js`], {
      root: PATHS.PROJECT_DIR,
      watch: true,
      beforeEmit: true
    }),
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
