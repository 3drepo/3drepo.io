const PATHS = require('../internals/webpack/tools/paths');

module.exports = {
  "stories": [
    "../**/*.stories.mdx",
    "../**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions"
  ],
  "framework": "@storybook/react",
  "core": {
    "builder": "webpack5"
  },
  webpackFinal: async (config, { configType }) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.

		config.resolve = {
			extensions: ['.ts', '.js', '.tsx'],
			descriptionFiles: ['package.json'],
			modules: ['node_modules'],
			alias: {
				'@': PATHS.SRC_DIR,
				'@assets': PATHS.ASSETS_DIR,
				'@components': PATHS.COMPONENTS,
				'@controls': PATHS.CONTROLS,
			  },
		};


    // Return the altered config
    return config;
  },
}