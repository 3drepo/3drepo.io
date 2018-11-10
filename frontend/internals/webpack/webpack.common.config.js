const {resolve} = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');

const MODES = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production'
};

module.exports = (options) => {
  const config = {
    mode: options.mode || MODES.DEVELOPMENT,
    context: resolve(__dirname, '../../'),
    entry: options.entry || './main.ts',
    output: Object.assign({
      path: resolve(__dirname, '../../../public/dist/'),
      filename: 'three_d_repo.min.js'
    }, options.output),
    resolve: {
      extensions: ['.ts', '.js', '.tsx']
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
          options: {
            transpileOnly: options.mode !== MODES.PRODUCTION
          }
        },
        {
          test: /\.(ts|tsx)$/,
          loader: 'lodash-ts-imports-loader',
          exclude: /node_modules/,
          enforce: 'pre'
        },
        {
          test: /\.(png|jpg|gif|svg)$/,
          use: [{
            loader: 'file-loader',
            options: {
              outputPath: '../images/',
              publicPath: 'images/',
              name() {
                if (options.mode === 'development') {
                  return '[name].[ext]'
                }

                return '[hash].[ext]'
              }
            }
          }]
        },
        {
          test: /\.(html)$/,
          use: {
            loader: 'html-loader',
            options: {
              minimize: true
            }
          }
        }
      ]
    },
    plugins: [
      new CopyWebpackPlugin([
        { from: 'node_modules/zxcvbn/dist/zxcvbn.js' },
        { from: 'manifest.json', to: '../' },
        { from: 'images/**', to: '../' },
        { from: 'icons/*', to: '../' },
        { from: 'custom/**', to: '../' },
        { from: 'unity/**', to: '../' },
        { from: 'manifest-icons/*', to: '../' },
        { from: 'manifest-icons/*', to: '../' },
        { 
          context: 'node_modules/material-design-icons/iconfont',
          from: '*.{eot,svg,ttf,woff,woff2}',
          to: '../fonts'
        },
        {
          context: 'node_modules/font-awesome/fonts',
          from: '*.{eot,svg,ttf,woff,woff2}',
          to: '../fonts'
        }
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
          '../../public/fonts/**/*.{svg,eot,ttf,woff,woff2}',
          '../../public/icons/**/*.{svg}',
          '../../public/images/**/*.{png,jpg}',
          '../../public/unity/**/*.{js,html,data,mem,css,png,jpg}',
        ],
        stripPrefix: '../../public/'
      }),
      ...(options.plugins || [])
    ]
  }

  return config;
};
