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
import { StoryObj, Meta } from '@storybook/react';
import { DatePicker } from '@controls/inputs/datePicker/datePicker.component';
import { LocalizationProviderDecorator } from './date.decorator';
import { FormDecorator } from '../inputDecorators';

export default {
	title: 'Inputs/Calendar/DatePicker',
	argTypes: {
		disablePast: {
			type: 'boolean',
		},
		disabled: {
			type: 'boolean',
		},
	},
	component: DatePicker,
	parameters: { controls: { exclude: [
		'onBlur',
		'onChange',
		'className',
		'inputRef',
		'PickerComponent',
	] } },
	decorators: [LocalizationProviderDecorator, FormDecorator],
} as Meta<typeof DatePicker>;

type Story = StoryObj<typeof DatePicker>;

export const ControlledFormDatePicker: Story = {
	args: {
		label: 'Controlled Date',
	},
};

export const ControlledFormDatePickerDefaultDate: Story = {
	args: {
		label: 'Controlled Date with today as default date',
		defaultValue: new Date('2020-01-30'),
	}
};
