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
import { Meta, StoryObj } from '@storybook/react';
import { LabelButton as Button } from '@controls/button';

export default {
	title: 'Buttons/Button',
	component: Button,
	args: {
		children: 'Label Button',
	},
	parameters: { controls: { exclude: [
		'classes',
		'tabIndex',
		'children',
		'action',
		'centerRipple',
		'disableRipple',
		'disableTouchRipple',
		'focusRipple',
		'focusVisibleClassName',
		'LinkComponent',
		'onFocusVisible',
		'sx',
		'TouchRippleProps',
		'touchRippleRef',
		'disableElevation',
		'disableFocusRipple',
		'endIcon',
		'href',
		'size',
		'startIcon',
		'ref',
	] } },
} as Meta<typeof Button>;

type Story = StoryObj<typeof Button>;

export const Label: Story = {};
