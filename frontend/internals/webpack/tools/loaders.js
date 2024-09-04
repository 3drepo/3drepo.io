const TSLoader = {
	test: /\.(ts|tsx)$/,
	loader: 'esbuild-loader',
	exclude: /node_modules/,
	options: {
		loader: 'tsx',
		target: 'es2015',
		tsconfigRaw: require('../../../tsconfig.json')
	}
};

const CSSLoader = {
  test: /\.css$/,
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
      name: '[name]-[hash].[ext]'
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
      name: '[name]-[hash].[ext]'
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
      name: '[name].[hash].js'
    }
  }]
};

module.exports = {
  TSLoader,
  CSSLoader,
  FontLoader,
  ImageLoader,
  HTMLLoader,
  WorkerLoader,
};
