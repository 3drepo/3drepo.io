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
import { DateTimePicker } from '@controls/inputs/datePicker/dateTimePicker.component';
import { LocalizationProviderDecorator } from './date.decorator';
import { FormDecorator } from '../inputDecorators';

const meta: Meta<typeof DateTimePicker> = {
	title: 'Inputs/Calendar/DateTimePicker',
	argTypes: {
		disablePast: {
			type: 'boolean',
		},
		disabled: {
			type: 'boolean',
		},
	},
	component: DateTimePicker,
	parameters: { controls: { exclude: [
		'onBlur',
		'onChange',
		'className',
		'inputRef',
		'PickerComponent',
	] } },
	decorators: [LocalizationProviderDecorator, FormDecorator],
};
export default meta;

type Story = StoryObj<typeof DateTimePicker>;

export const ControlledFormDateTimePicker: Story = {
	args: {
		label: 'Controlled DateTime',
	},
};

export const ControlledFormDateTimePickerDefaultDate: Story = {
	args: {
		label: 'Controlled DateTime with now as default date',
		defaultValue: new Date('2020-01-30 16:30'),
	},
};
