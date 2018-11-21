const MODES = require('./modes');

const TSLoader = (options) => ({
  test: /\.(ts|tsx)$/,
  loader: 'ts-loader',
  exclude: /node_modules/,
  options: {
    transpileOnly: options.mode !== MODES.PRODUCTION
  }
})

const LodashTSLoader = {
  test: /\.(ts|tsx)$/,
  loader: 'lodash-ts-imports-loader',
  exclude: /node_modules/,
  enforce: 'pre'
};

const CSSLoader = {
  test: /\.css$/,
  exclude: /node-modules/,
  use:[
    'style-loader', 
    { 
      loader: 'css-loader',
      options: {
        importLoaders: 1,
        import: false
      }
    },
    {
      loader: 'postcss-loader',
      options: {
        config: {
          path: './internals/webpack/tools'
        }
      }
    }
  ]
};

const CSSExternalLoader = {
  test: /\.css$/,
  include: /node-modules/,
  use: [
    'style-loader',
    {
      loader: 'css-loader',
      options: {
        importLoaders: 1
      }
    },
    {
      loader: 'postcss-loader',
      options: {
        config: {
          path: './internals/webpack/tools'
        }
      }
    }
  ]
};

const FontLoader = {
  test: /\.(eot|otf|ttf|woff|woff2)$/,
  use: [{
    loader: 'file-loader',
    options: {
      outputPath: '../fonts/',
      publicPath: 'fonts/',
      name: '[name]-[hash].[ext]'
    }
  }]
};

const ImageLoader = {
  test: /\.(png|jpg|gif|svg)$/,
  use: [{
    loader: 'file-loader',
    options: {
      outputPath: '../images/',
      publicPath: 'images/',
      name: '[name]-[hash].[ext]'
    }
  }]
};

const HTMLLoader = {
  test: /\.(html)$/,
  use: {
    loader: 'html-loader',
      options: {
      minimize: true
    }
  }
};

const PugLoader = {
  test: /\.pug$/,
  use: [
    {
      loader: 'file-loader',
      options: {
        outputPath: '../templates/',
        publicPath: 'templates/',
        name: '[name].html'
      }
    },
    'extract-loader',
    'html-loader',
    'pug-html-loader'
  ]
};

module.exports = {
  TSLoader,
  LodashTSLoader,
  CSSLoader,
  CSSExternalLoader,
  FontLoader,
  ImageLoader,
  HTMLLoader,
  PugLoader
};