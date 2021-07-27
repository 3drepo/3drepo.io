const LiveReloadPlugin = require('webpack-livereload-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin')
const getWebpackConfig = require('./webpack.common.config');
const MODES = require('./tools/modes');
const PATHS = require('./tools/paths');
const glob = require('glob');
const path = require('path');
const loaders = require('./tools/loaders');

const statsOptions = {
  assets: true,
  hash: false,
  timings: true,
  chunks: false,
  chunkModules: false,
  modules: false,
  depth: false,
  children: false,
  version: true,
  warnings: false,
  cached: false,
  cachedAssets: false,
  reasons: false,
  source: false,
  errorDetails: true,
  moduleTrace: true,
  performance: true
};

function getEntries(pattern) {
	const entries = {};

	glob.sync(pattern).forEach((file) => {
		if (!file.includes('build')) {
			console.log(path.basename(file, '.ts'), file);

			entries[path.basename(file, '.ts')] = file;
		}
	});

	return entries;
}

module.exports = {... getWebpackConfig({mode: MODES.DEVELOPMENT}),
	context: PATHS.APP_DIR,
	entry: getEntries(path.resolve(PATHS.PROJECT_DIR, 'frontend', 'test', '*')),
	output: {
		path: path.resolve(PATHS.PROJECT_DIR, './frontend/test/build/'),
		filename: '[name].js'
	},
	module: {
		rules: [
			loaders.TSLoader({transpileOnly: true}),
			loaders.LodashTSLoader,
		],
	},
	plugins: [],
	target: 'node',
	stats: statsOptions
}