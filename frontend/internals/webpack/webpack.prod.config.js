const CopyWebpackPlugin = require('copy-webpack-plugin');
const getWebpackConfig = require('./webpack.common.config');
const fs = require('fs');
const { resolve } = require('path');
const { PROJECT_DIR } = require('./tools/paths');
const MODES = require('./tools/modes');

const outputNames = {
  main: 'three_d_repo.min.js',
  support: 'support.min.js',
  maintenance: 'maintenance.min.js',
  unity: '../unity/unity-util.js'
};

const customFolderExists = fs.existsSync(resolve(PROJECT_DIR, 'custom'));

module.exports = (env) => getWebpackConfig(env, {
  mode: MODES.PRODUCTION,
  entry: {
    unity: './src/globals/unity-util-external.ts'
  },
  output: {
    filename: ({ chunk: { name }}) => outputNames[name] || '[name].js'
  },
  ...(customFolderExists && {
	  plugins: [
		new CopyWebpackPlugin({
			patterns: [
				{ context: './', from: 'custom/**', to: '../' }
			],
		})
	  ],	
  }),
  stats: 'errors-only'
});