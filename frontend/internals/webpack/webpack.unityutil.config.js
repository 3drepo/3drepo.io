const { resolve } = require('path');
const loaders = require('./tools/loaders');
const MODES = require('./tools/modes');

module.exports = {
	mode: MODES.PRODUCTION,
	entry: { main: './src/globals/unity-util-external.ts' },
	output: {
		path: resolve(__dirname, '../../../public/unity/'),
		filename: 'unity-util.js'
	},
	resolve: {
		extensions: ['.ts', '.js', '.json']
	},
	module: {
		rules: [
			loaders.TSLoader,
			loaders.CSSLoader,
			loaders.FontLoader,
			loaders.ImageLoader,
			loaders.HTMLLoader,
		],
	},
};
