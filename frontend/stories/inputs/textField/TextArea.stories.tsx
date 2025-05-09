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
import { TextArea } from '@controls/inputs/textArea/textArea.component';
import { StoryObj, Meta } from '@storybook/react';
import { FormDecorator } from '../inputDecorators';

export default {
	title: 'Inputs/TextField/TextArea',
	argTypes: {
		label: {
			type: 'string',
		},
		defaultValue: {
			type: 'string',
		},
		value: {
			type: 'string',
		},
		error: {
			type: 'boolean',
		},
		helperText: {
			type: 'string',
		},
		minRows: {
			type: 'number',
		},
		disabled: {
			type: 'boolean',
		},
	},
	component: TextArea,
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
} as Meta<typeof TextArea>;

type Story = StoryObj<typeof TextArea>;

export const ControlledTextArea: Story = {
	args: {
		label: 'Controlled Multi Line input',
		minRows: 3,
	},
};
