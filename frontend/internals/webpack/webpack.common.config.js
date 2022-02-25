const CopyWebpackPlugin = require('copy-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { InjectManifest } = require('workbox-webpack-plugin');
const webpack = require('webpack');

const PATHS = require('./tools/paths');
const MODES = require('./tools/modes');
const loaders = require('./tools/loaders');

module.exports = (env, options) => {
	const config = {
		mode: options.mode || MODES.DEVELOPMENT,
		context: PATHS.APP_DIR,
		entry: {
			maintenance: './src/maintenance.ts',
			support: './src/support.ts',
			main: './src/main.tsx',
			...options.entry
		},
		output: {
			path: PATHS.DIST_DIR,
			filename: '[name].[chunkhash].js', 
			pathinfo: true,
			...options.output 
		},
		module: {
			rules: [
				loaders.TSLoader({ transpileOnly: env.noTypeChecking }),
				loaders.LodashTSLoader,
				loaders.CSSLoader,
				loaders.CSSExternalLoader,
				loaders.FontLoader,
				loaders.ImageLoader,
				loaders.HTMLLoader
			],
		},
		plugins: [
			new CopyWebpackPlugin({
				patterns:[
					{ from: 'node_modules/zxcvbn/dist/zxcvbn.js' },
					{ from: 'manifest.json', to: '../' },
					{ from: 'assets/images/**', to: '../' },
					{ from: 'assets/icons/*', to: '../' },
					{ from: 'unity/**', to: '../' },
					//backwards compatibility to Unity 2019 (added on 4.12)
					{ from: 'unity/Build/unity.loader.js', to: '../unity/Build/UnityLoader.js' },
					{ from: 'assets/manifest-icons/*', to: '../' },
					{ from: 'serviceWorkerExtras.js', to: '../' },
					{ context: '../resources', from: '**/*.html', to: '../templates' },
					{ context: '../resources', from: '**/*.csv', to: '../templates' }
				]
			}),
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
			new webpack.ProvidePlugin({
				process: 'process/browser',
			}),
			...(options.plugins || []),
		],
		resolve: {
			extensions: ['.ts', '.js', '.tsx'],
			descriptionFiles: ['package.json'],
			modules: ['node_modules'],
			alias: {
				'@': PATHS.SRC_DIR,
				'@assets': PATHS.ASSETS_DIR,
				'@components': PATHS.COMPONENTS,
				'@controls': PATHS.CONTROLS,
			},
		},
		target: 'web',

		stats: options.stats
	}

	if (options.mode !== MODES.DEVELOPMENT) {
		config.plugins.push(
			new InjectManifest({
				swSrc: './serviceWorkerExtras.js',
				swDest: '../sw.js',
				exclude: ['**/*.map']
			}),
		);
	}

	return config;
};
