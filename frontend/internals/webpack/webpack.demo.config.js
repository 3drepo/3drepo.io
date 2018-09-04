const getWebpackConfig = require('./webpack.common.config');

module.exports = getWebpackConfig({
	mode: "production",
	entry: "./globals/demo.ts",
	output: {
		path: __dirname + "./../../public/unity/",
		filename: "unity-util.js"
	}
});
