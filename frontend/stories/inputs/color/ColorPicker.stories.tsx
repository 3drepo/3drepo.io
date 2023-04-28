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
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ColorPicker } from '@controls/inputs/colorPicker/colorPicker.component';
import { FormContainer } from '../FormInput.styles';

export default {
	title: 'Inputs/Color/ColorPicker',
	argTypes: {
		disabled: {
			type: 'boolean',
		},
	},
	component: ColorPicker,
	parameters: { controls: { exclude: [
		'onBlur',
		'onChange',
		'className',
		'inputRef',
	] } },
} as ComponentMeta<typeof ColorPicker>;

const Controlled: ComponentStory<typeof ColorPicker> = (args) => (
	<FormContainer>
		<ColorPicker {...args} />
	</FormContainer>
);

export const ControlledFormColorPicker = Controlled.bind({});

export const ControlledFormColorPickerColorAndOpacity = Controlled.bind({});
ControlledFormColorPickerColorAndOpacity.args = {
	defaultValue: { color: [210, 89, 159], opacity: 0.4 },
};

export const ControlledFormColorPickerColorOnly = Controlled.bind({});
ControlledFormColorPickerColorOnly.args = {
	defaultValue: { opacity: 0.4 },
};

export const ControlledFormColorPickerOpacityOnly = Controlled.bind({});
ControlledFormColorPickerOpacityOnly.args = {
	defaultValue: { color: [34, 189, 230] },
};
