const LiveReloadPlugin = require('webpack-livereload-plugin');
const getWebpackConfig = require('./webpack.common.config');
const MODES = require('./tools/modes');

const statsOptions = {
  hash: false,
  chunks: false,
  chunkModules: false,
  modules: false,
  children: false,
  warnings: false,
  cachedModules: false,
  cachedAssets: false,
  reasons: false,
  errorDetails: true,
};

module.exports = (env) => getWebpackConfig(env, {
  mode: MODES.DEVELOPMENT,
  devtool: 'inline-source-map',
  output: {
	clean: true
  },
  plugins: [
    new LiveReloadPlugin({
      hostname: 'localhost',
      port: 35729,
      start: true,
      quiet: false
    })
  ],
  performance: {
    hints: 'warnings'
  },
  stats: statsOptions
});
