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
import { PasswordField } from '@controls/inputs/passwordField/passwordField.component';
import { StoryObj, Meta } from '@storybook/react';

export default {
	title: 'Inputs/TextField/PasswordField',
	argTypes: {
		label: {
			type: 'string',
		},
		defaultValue: {
			type: 'string',
		},
		disabled: {
			type: 'boolean',
		},
		value: {
			type: 'string',
		},
		variant: {
			options: ['filled', 'outlined'],
			control: { type: 'select' },
		},
	},
	component: PasswordField,
	parameters: { controls: { exclude: [
		'margin',
		'ref',
		'hiddenLabel',
		'onBlur',
		'onChange',
		'name',
		'className',
		'inputRef',
	] } },
} as Meta<typeof PasswordField>;

type Story = StoryObj<typeof PasswordField>;

export const ControlledFormPasswordField: Story = {
	args: {
		label: 'Controlled String input',
	},
};
