const PATHS = require('../internals/webpack/tools/paths');
const { resolve } = require('path');

module.exports = {
  "stories": [
    "../**/*.stories.mdx",
    "../**/*.stories.@(js|jsx|ts|tsx)"
  ],

  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],

  "framework": {
    name: '@storybook/react-webpack5',
    options: {}
  },

  "core": {
    "disableTelemetry": true
  },

  webpackFinal: async (config, { configType }) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.

    if (configType == 'PRODUCTION') {
      config.output = {
        ...config.output,
        "path": resolve(PATHS.PUBLIC_DIR, 'storybook'),
      }
    }

    config = {
      ...config,
      resolve:{
        ...config.resolve,
        descriptionFiles: ['package.json'],
        alias : {
          '@': PATHS.SRC_DIR,
          '@assets': PATHS.ASSETS_DIR,
          '@components': PATHS.COMPONENTS,
          '@controls': PATHS.CONTROLS,
        }
      },
      module: {
        ...config.module,
        strictExportPresence: true,
      }
    };

    // Return the altered config
    return config;
  },

  docs: {
    autodocs: true
  }
}