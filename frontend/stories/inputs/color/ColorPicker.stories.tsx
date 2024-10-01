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
import { ColorPicker } from '@controls/inputs/colorPicker/colorPicker.component';
import { UNSET_RGB_COLOR } from '@controls/inputs/colorPicker/colorPicker.helpers';
import { useState } from 'react';
import { FormDecorator } from '../inputDecorators';
import { RgbArray } from '@/v5/helpers/colors.helper';

export default {
	title: 'Inputs/Color/ColorPicker',
	component: ColorPicker,
	parameters: { controls: { exclude: [
		'onBlur',
		'onChange',
		'className',
		'inputRef',
	] } },
	decorators: [FormDecorator],
	args: {
		// this should reflect DEFAULT_VALUE in ColorPicker file
		defaultValue: { color: UNSET_RGB_COLOR, opacity: 1 },
	},
} as Meta<typeof ColorPicker>;

type Story = StoryObj<typeof ColorPicker>;

export const FormColorPickerDefault: Story = {};

export const FormColorPickerColorAndOpacitySet: Story = {
	args: {
		value: { color: [210, 89, 159] as RgbArray, opacity: 0.4 },
	},
};

export const FormColorPickerOnlyColorSet: Story = {
	args: {
		value: { color: [34, 189, 230] as RgbArray },
	},
};

export const FormColorPickerOnlyOpacitySet: Story = {
	args: {
		value: { opacity: 0.4 },
	},
};

export const ControlledFormColorPicker: Story = {
	render: ({ value: initialValue, ...args }) => {
		const [value, setValue] = useState(initialValue);
		const handleChange = (event) => setValue(event.target.value as any);
		return (<ColorPicker value={value} onChange={handleChange} {...args} />);
	},
};
