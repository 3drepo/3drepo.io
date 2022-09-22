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
import { FormMultiSelect } from '@/v5/ui/routes/viewer/formElements/formMultiSelect/formMultiSelect.component';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { FormContainer, FormData } from './FormInput.styles';

export default {
	title: 'Inputs/FormMultiSelect',
	argTypes: {
		label: {
			type: 'string',
		},
		defaultValue: {
			type: 'string',
		},
		values: {
			control: 'array',
		},
		disabled: {
			type: 'boolean',
		},
	},
	component: FormMultiSelect,
	parameters: { controls: { exclude: ['control'] } },
} as ComponentMeta<typeof FormMultiSelect>;

const Controlled: ComponentStory<typeof FormMultiSelect> = (args) => {
	const { control, watch } = useForm({ mode: 'onChange' });

	return (
		<FormContainer>
			<FormMultiSelect
				name="multiselect"
				control={control}
				{...args}
			/>
			<FormData>
				Value: {watch('multiselect')}
			</FormData>
		</FormContainer>
	);
};

export const ControlledFormSelect = Controlled.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
ControlledFormSelect.args = {
	label: 'Controlled Multi Select input',
	values: ["value 1", "value 2", "value 3", "Longer value 4"],
};
