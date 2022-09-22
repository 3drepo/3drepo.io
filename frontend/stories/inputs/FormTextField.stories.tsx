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
import { FormTextField } from '@controls/formTextField/formTextField.component';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { FormContainer } from './FormInput.styles';

export default {
	title: 'Inputs/FormTextField',
	argTypes: {
		label: {
			type: 'string',
		},
		defaultValue: {
			type: 'string',
		},
		formError: {
			type: 'string',
		},
		disabled: {
			type: 'boolean',
		},
	},
	component: FormTextField,
	parameters: { controls: { exclude: ['control', 'margin', 'hiddenLabel', 'ref'] } },
} as ComponentMeta<typeof FormTextField>;

const Controlled: ComponentStory<typeof FormTextField> = (args) => {
	const { control } = useForm({ mode: 'onChange' });

	return (
		<FormContainer>
			<FormTextField
				name="textfield"
				control={control}
				{...args}
				formError={args.formError ? { message: args.formError } : null}
			/>
		</FormContainer>
	);
};

export const ControlledFormTextField = Controlled.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
ControlledFormTextField.args = {
	label: 'Controlled Single Line input',
};
