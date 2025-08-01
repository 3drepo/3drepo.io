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
import { TextAreaFixedSize } from '@controls/inputs/textArea/textAreaFixedSize.component';
import { StoryObj, Meta } from '@storybook/react';
import { FormDecorator } from '../inputDecorators';

const meta: Meta<typeof TextAreaFixedSize> = {
	title: 'Inputs/TextField/TextAreaFixedSize',
	argTypes: {
		label: {
			type: 'string',
		},
		value: {
			type: 'string',
		},
		defaultValue: {
			type: 'string',
		},
		disabled: {
			type: 'boolean',
		},
		height: {
			type: 'number',
		},
	},
	component: TextAreaFixedSize,
	decorators: [FormDecorator],
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
};
export default meta;

type Story = StoryObj<typeof TextAreaFixedSize>;

export const ControlledFormTextArea: Story = {
	args: {
		label: 'Controlled Fixed Multi Line input',
	},
};
