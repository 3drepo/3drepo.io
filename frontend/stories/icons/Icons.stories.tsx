/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { IconsTemplate } from './icons.component';
import { getIcons } from './icons.helpers';

export default {
	title: 'Icons',
	argTypes: {
		backgroundColor: {
			type: 'string',
		},
		iconSize: {
			type: 'number',
		},
		color: {
			type: 'string',
		},
	},
	args: {
		iconSize: 10,
	},
	component: IconsTemplate,
	parameters: { controls: { exclude: 'icons' } },
};

export const Controls = {
	title: 'Icons/Controls',
	args: {
		icons: getIcons(require.context('@assets/icons/controls/', false, /\.*(svg)/), 'controls'),
	},
};

export const Filters = {
	title: 'Icons/Filters',
	args: {
		icons: getIcons(require.context('@assets/icons/filters/', false, /\.*(svg)/), 'filters'),
	},
};

export const Filled = {
	title: 'Icons/Filled',
	args: {
		icons: getIcons(require.context('@assets/icons/filled/', false, /\.*(svg)/), 'filled'),
	},
};

export const Measure = {
	title: 'Icons/Measure',
	args: {
		icons: getIcons(require.context('@assets/icons/measurements/', false, /\.*(svg)/), 'measurements'),
	},
};

export const Outlined = {
	title: 'Icons/Outlined',
	args: {
		icons: getIcons(require.context('@assets/icons/outlined/', false, /\.*(svg)/), 'outlined'),
	},
};

export const TwoToned = {
	title: 'Icons/TwoToned',
	args: {
		icons: getIcons(require.context('@assets/icons/twoToned/', false, /\.*(svg)/), 'twoToned'),
	},
	parameters: { controls: { exclude: 'color' } },
};

export const V4 = {
	title: 'Icons/V4',
	args: {
		icons: getIcons(require.context('@assets/icons/v4/', false, /\.*(svg)/), 'v4'),
		parameters: { controls: { exclude: 'color' } },
	},
};
