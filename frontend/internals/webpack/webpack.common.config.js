const {resolve} = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const loaders = require('./tools/loaders');

module.exports = (options) => {
  const config = {
    mode: options.mode || MODES.DEVELOPMENT,
    context: resolve(__dirname, '../../'),
    entry: options.entry || './main.ts',
    output: Object.assign({
      path: resolve(__dirname, '../../../public/dist/'),
      filename: 'three_d_repo.[contenthash].js'
    }, options.output),
    resolve: {
      extensions: ['.ts', '.js', '.tsx']
    },
    module: {
      rules: [
        loaders.TSLoader(options),
        loaders.LodashTSLoader,
        loaders.CSSLoader,
        loaders.CSSExternalLoader,
        loaders.getFontLoader(options),
        loaders.getImageLoader(options),
        loaders.HTMLLoader,
        loaders.PugLoader
      ]
    },
    plugins: [
      new CopyWebpackPlugin([
        { from: 'node_modules/zxcvbn/dist/zxcvbn.js' },
        { from: 'manifest.json', to: '../' },
        { from: 'images/**', to: '../' },
        { from: 'icons/*', to: '../' },
        { from: 'unity/**', to: '../' },
        { from: 'manifest-icons/*', to: '../' }
      ], options),

      new HTMLWebpackPlugin({
        template: './index.html',
        filename: '../index.html'
      }),

      new SWPrecacheWebpackPlugin({
        filename: '../service-worker.js',
        staticFileGlobs: [
          '../../public/index.html',
          '../../public/templates/.{html}',
          '../../public/dist/**/*.{js,css}',
          '../../public/dist/**/*.{svg,eot,ttf,woff,woff2}',
          '../../public/icons/**/*.{svg}',
          '../../public/images/**/*.{png,jpg}',
          '../../public/unity/**/*.{js,html,data,mem,css,png,jpg}',
        ],
        stripPrefix: '../../public/'
      }),

      ...(options.plugins || [])
    ],
    stats: options.stats
  }

  return config;
};
