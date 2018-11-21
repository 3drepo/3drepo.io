const {resolve} = require('path');
const getWebpackConfig = require('./webpack.common.config');
const MODES = require('./tools/modes');

module.exports = getWebpackConfig({
	mode: MODES.PRODUCTION,
	entry: './globals/demo.ts',
	output: {
		path: resolve(__dirname, '../../../public/unity/'),
		filename: 'unity-util.js'
	}
});
