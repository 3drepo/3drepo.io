const TSLoader = ({ transpileOnly }) => ({
  test: /\.(ts|tsx)$/,
  loader: 'ts-loader',
  exclude: /node_modules/,
  options: {
    transpileOnly
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
  exclude: /node_modules/,
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
  include: /node_modules/,
  use: ['style-loader', 'css-loader']
};

const FontLoader = {
  test: /\.(woff(2)?|ttf|otf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
  type: 'asset/resource',
  dependency: { not: ['url'] },
  include: /node_modules/,
  use: [{
    loader: 'url-loader',
    options: {
      outputPath: '../fonts/',
      publicPath: 'fonts/',
      name: '[name]-[chunkhash].[ext]'
    },
  }],
  type: 'javascript/auto'
};

const ImageLoader = {
  test: /\.(png|jpg|gif|svg)$/,
  type: 'asset/resource',
  dependency: { not: ['url'] },
  use: [{
    loader: 'url-loader',
    options: {
      outputPath: '../images/',
      publicPath: 'images/',
      name: '[name]-[chunkhash].[ext]'
    }
  }],
  type: 'javascript/auto'
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

const WorkerLoader = {
  test: /\.worker\.ts$/,
  exclude: /node_modules/,
  use: [{
    loader: 'worker-loader',
    options: {
      inline: true,
      name: '[name].[chunkhash].js'
    }
  }]
};

module.exports = {
  TSLoader,
  LodashTSLoader,
  CSSLoader,
  CSSExternalLoader,
  FontLoader,
  ImageLoader,
  HTMLLoader,
  WorkerLoader,
};
