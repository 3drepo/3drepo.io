const CopyWebpackPlugin = require('copy-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

const PATHS = require('./tools/paths');
const loaders = require('./tools/loaders');

module.exports = (options) => ({
	mode: options.mode,
	context: PATHS.APP_DIR,
	entry: {
		maintenance: './src/maintenance.ts',
		support: './src/support.ts',
		main: './src/main.tsx',
		indexeddbworker: {
			import: './src/globals/unity-indexeddb-worker.ts',
			filename: '../unity/indexeddbworker.js' // This particular entry should be in the unity folder, which is a sibling of dist
		},
		...options.entry
	},
	output: {
		path: PATHS.DIST_DIR,
		filename: '[name].[chunkhash].js',
		...options.output
	},
	module: {
		rules: [
			loaders.TSLoader,
			loaders.CSSLoader,
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
				{ from: 'assets/**', to: '../' },
				{ from: 'unity/**', to: '../' },
				//backwards compatibility to Unity 2019 (added on 4.12)
				{ from: 'unity/Build/unity.loader.js', to: '../unity/Build/UnityLoader.js' },
				{ from: 'assets/manifest-icons/*', to: '../' },
				{ context: '../resources', from: '**/*.html', to: '../templates' },
				{ context: '../resources', from: '**/*.csv', to: '../templates' }
			]
		}),
		new HTMLWebpackPlugin({
			template: './index.html',
			filename: '../index.html',
			minify: true,
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
			"styled-components": path.resolve("node_modules", "styled-components"),
		},
	},
	target: 'web',
	stats: options.stats
});
