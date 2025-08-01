/**
 *  Copyright (C) 2025 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import type { StorybookConfig } from '@storybook/react-webpack5';
import PATHS from '../internals/webpack/tools/paths';
import { resolve } from 'path';

const config: StorybookConfig = {
  "stories": [
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-webpack5-compiler-swc"
  ],
  "framework": {
    "name": "@storybook/react-webpack5",
    "options": {}
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
};
export default config;