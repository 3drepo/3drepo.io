const {resolve} = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin')
const loaders = require('./tools/loaders');

const PROJECT_DIR = resolve(__dirname, '../../../');
const APP_DIR = resolve(PROJECT_DIR, 'frontend');
const DIST_DIR = resolve(PROJECT_DIR, 'public/dist/');

module.exports = (options) => {
  const config = {
    mode: options.mode || MODES.DEVELOPMENT,
    context: APP_DIR,
    entry: options.entry || './main.ts',
    output: Object.assign({
      path: DIST_DIR,
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
        loaders.PugLoader
      ],
    },

    plugins: [
      new CleanWebpackPlugin([DIST_DIR], { root: PROJECT_DIR }),
      new CopyWebpackPlugin([
        { from: 'node_modules/zxcvbn/dist/zxcvbn.js' },
        { from: 'manifest.json', to: '../' },
        { from: 'images/**', to: '../' },
        { from: 'icons/*', to: '../' },
        { from: 'unity/**', to: '../' },
        { from: 'manifest-icons/*', to: '../' },
        { context: '../html', from: '**/*.html', to: '../templates' }
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

    resolve: {
      extensions: ['.ts', '.js', '.tsx'],
      descriptionFiles: ['package.json'],
      modules: ['node_modules']
    },

    target: 'web',

    stats: options.stats
  }

  return config;
};
