/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { ComponentMeta } from '@storybook/react';
import { IconsTemplate } from '../icons.component';
import { getIcons } from '../icons.helper';

export default {
	title: 'Icons/\\Filled',
	argTypes: {
		backgroundColor: {
			type: 'string',
		},
		iconSize: {
			type: 'number',
			defaultValue: 10,
		},
		color: {
			type: 'string',
		},
	},
	parameters: { controls: { exclude: 'icons' } },
} as ComponentMeta<any>;

export const Icons = IconsTemplate.bind({});
Icons.args = {
	icons: getIcons(require.context('@assets/icons/filled/', false, /\.*(svg)/), 'filled'),
};
