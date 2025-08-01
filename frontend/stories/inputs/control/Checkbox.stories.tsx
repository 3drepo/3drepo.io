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
import { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from '@controls/inputs/checkbox/checkbox.component';
import { FormDecorator } from '../inputDecorators';

const meta: Meta<typeof Checkbox> = {
	title: 'Inputs/Control/Checkbox',
	argTypes: {
		label: {
			type: 'string',
		},
		defaultValue: {
			type: 'boolean',
		},
		value: {
			type: 'boolean',
		},
	},
	component: Checkbox,
	parameters: { controls: { exclude: [
		'onBlur',
		'onChange',
		'name',
		'className',
		'inputRef',
		'ref',
	] } },
	decorators: [FormDecorator],
};
export default meta;

type Story = StoryObj<typeof Checkbox>;

export const ControlledFormCheckbox: Story = {
	args: {
		label: 'Controlled Checkbox input',
	},
};
