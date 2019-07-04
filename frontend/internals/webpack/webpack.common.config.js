const CopyWebpackPlugin = require('copy-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const OfflinePlugin = require('offline-plugin');

const PATHS = require('./tools/paths');
const MODES = require('./tools/modes');
const loaders = require('./tools/loaders');

module.exports = (options) => {
  const config = {
    mode: options.mode || MODES.DEVELOPMENT,
    context: PATHS.APP_DIR,
    entry: options.entry || './main.tsx',
    output: Object.assign({
      path: PATHS.DIST_DIR,
      filename: 'three_d_repo.[hash].js'
    }, options.output),
    module: {
      rules: [
        loaders.TSLoader(options),
        loaders.LodashTSLoader,
        loaders.CSSLoader,
        loaders.CSSExternalLoader,
        loaders.FontLoader,
        loaders.ImageLoader,
        loaders.HTMLLoader,
        loaders.PugLoader,
      ],
    },
    plugins: [
      new CopyWebpackPlugin([
        { from: 'node_modules/zxcvbn/dist/zxcvbn.js' },
        { from: 'manifest.json', to: '../' },
        { from: 'images/**', to: '../' },
        { from: 'icons/*', to: '../' },
        { from: 'unity/**', to: '../' },
        { from: 'manifest-icons/*', to: '../' },
        { from: 'serviceWorkerExtras.js', to: '../' },
        { context: '../resources', from: '**/*.html', to: '../templates' }
      ], options),
      new HTMLWebpackPlugin({
        template: './index.html',
        filename: '../index.html',
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      }),
      ...(options.plugins || []),
      new OfflinePlugin({
        ServiceWorker: {
          output: '../sw.js',
          entry: './serviceWorkerExtras.js'
        },
        excludes: ['**/*.map']
      })
    ],

    resolve: {
      extensions: ['.ts', '.js', '.tsx'],
      descriptionFiles: ['package.json'],
      modules: ['node_modules']
    },

    target: 'web',

    stats: options.stats
  }

  if (options.mode !== MODES.DEVELOPMENT) {

  }

  return config;
};
