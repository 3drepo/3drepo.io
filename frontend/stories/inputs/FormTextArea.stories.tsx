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
import { FormTextArea } from '@controls/formTextArea/formTextArea.component';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { FormContainer, FormData } from './FormInput.styles';

export default {
	title: 'Inputs/FormTextArea',
	argTypes: {
		label: {
			type: 'string',
		},
		defaultValue: {
			type: 'boolean',
		},
		formError: {
			type: 'string',
		},
	},
	component: FormTextArea,
	parameters: { controls: { exclude: ['control'] } },
} as ComponentMeta<typeof FormTextArea>;

const Controlled: ComponentStory<typeof FormTextArea> = (args) => {
	const { control, watch } = useForm({ mode: 'onChange' });

	return (
		<FormContainer>
			<FormTextArea
				name="textfield"
				control={control}
				{...args}
				formError={args.formError ? { message: args.formError } : null}
			/>
			<FormData>
				<span>Value:</span>
				<span>{watch('textfield')}</span>
			</FormData>
		</FormContainer>
	);
};

export const ControlledFormTextArea = Controlled.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
ControlledFormTextArea.args = {
	label: 'Controlled Multi Line input',
};
