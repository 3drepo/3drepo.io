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
    }),
  ],
  performance: {
    hints: 'warnings'
  },
  stats: {
    // Add asset Information
    assets: true,
    // Add build date and time information
    builtAt: true,
    // Add information about cached (not built) modules
    cached: true,
    // Add children information
    children: false,
    // Add errors
    errors: true,
    // Add details to errors (like resolving log)
    errorDetails: true,
    // Add the hash of the compilation
    hash: true,
    // Add built modules information
    modules: false,
    // Show dependencies and origin of warnings/errors (since webpack 2.5.0)
    moduleTrace: false,
  }
});
