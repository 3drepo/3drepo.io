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
        import: false
      }
    }
  ]
};

const CSSExternalLoader = {
  test: /\.css$/,
  include: /node-modules/,
  use: [
    'style-loader',
    { loader: 'css-loader', options: { importLoaders: 1 } },
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

const getFontLoader = (options) => ({
  test: /\.(eot|otf|ttf|woff|woff2)$/,
  use: [{
    loader: 'file-loader',
    options: {
      outputPath: '../fonts/',
      publicPath: 'fonts/',
      name() {
        if (options.mode === 'development') {
          return '[name].[ext]';
        }

        return '[hash].[ext]';
      }
    }
  }]
});

const getImageLoader = (options) => ({
  test: /\.(png|jpg|gif|svg)$/,
  use: [{
    loader: 'file-loader',
    options: {
      outputPath: '../images/',
      publicPath: 'images/',
      name() {
        if (options.mode === 'development') {
          return '[name].[ext]';
        }

        return '[hash].[ext]';
      }
    }
  }]
});

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
  getFontLoader,
  getImageLoader,
  HTMLLoader,
  PugLoader
};