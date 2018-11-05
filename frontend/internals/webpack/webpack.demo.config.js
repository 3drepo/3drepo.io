const {resolve} = require('path');
const getWebpackConfig = require('./webpack.common.config');

module.exports = getWebpackConfig({
	mode: 'production',
	entry: './globals/demo.ts',
	output: {
		path: resolve(__dirname, '../../../public/unity/'),
		filename: 'unity-util.js'
	}
});
