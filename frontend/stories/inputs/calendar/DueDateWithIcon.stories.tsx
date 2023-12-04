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
import { DueDateWithIcon } from '@controls/dueDate/dueDateWithIcon/dueDateWithIcon.component';
import { LocalizationProviderDecorator } from './date.decorator';
import { FormDecorator } from '../inputDecorators';

export default {
	title: 'Inputs/Calendar/DueDateWithIcon',
	argTypes: {
		disablePast: {
			type: 'boolean',
		},
		disabled: {
			type: 'boolean',
		},
		tooltip: {
			type: 'string',
		},
	},
	component: DueDateWithIcon,
	parameters: { controls: { exclude: [
		'onBlur',
		'error',
		'name',
		'label',
		'helperText',
		'onChange',
		'className',
		'inputRef',
		'PickerComponent',
	] } },
	decorators: [LocalizationProviderDecorator, FormDecorator],
} as Meta<typeof DueDateWithIcon>;

type Story = StoryObj<typeof DueDateWithIcon>;

export const UnsetValue: Story = {
	args: {
		tooltip: 'Set date',
	},
};

export const PresetValue: Story = {
	args: {
		value: new Date(),
		tooltip: 'this is a custom tooltip',
	},
};