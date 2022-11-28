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
import { Checkbox } from '@controls/inputs/checkbox/checkbox.component';
import { useForm } from 'react-hook-form';
import { FormContainer } from '../FormInput.styles';

export default {
	title: 'Inputs/Control/FormCheckbox',
	argTypes: {
		label: {
			type: 'string',
		},
		defaultValue: {
			type: 'boolean',
		},
	},
	component: Checkbox,
	parameters: { controls: { exclude: ['control', 'formError', 'ref'] } },
} as ComponentMeta<typeof Checkbox>;

const Controlled: ComponentStory<typeof Checkbox> = (args) => {
	const { control } = useForm({ mode: 'onChange' });

	return (
		<FormContainer>
			<Checkbox
				name="checkbox"
				control={control}
				{...args}
			/>
		</FormContainer>
	);
};

export const ControlledFormCheckbox = Controlled.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
ControlledFormCheckbox.args = {
	label: 'Controlled Checkbox input',
};
