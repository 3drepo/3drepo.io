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
import { Button } from '@controls/button';
import { FormInvisibleMultiSelect } from '@controls/formInvisibleMultiSelect/formInvisibleMultiSelect.component';
import { MultiSelectMenuItem } from '@controls/formMultiSelect/multiSelectMenuItem/multiSelectMenuItem.component';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { FormContainer } from '../FormInput.styles';

export default {
	title: 'Inputs/Select/FormInvisibleMultiSelect',
	argTypes: {
		label: {
			type: 'string',
		},
		defaultValue: {
			type: 'string',
		},
		disabled: {
			type: 'boolean',
		},
	},
	component: FormInvisibleMultiSelect,
	parameters: { controls: { exclude: ['control'] } },
} as ComponentMeta<typeof FormInvisibleMultiSelect>;

const Controlled: ComponentStory<typeof FormInvisibleMultiSelect> = (args) => {
	const { control } = useForm({ mode: 'onChange' });

	return (
		<FormContainer>
			<FormInvisibleMultiSelect
				name="invisible-multiselect"
				control={control}
				TriggerComponent={<Button variant="contained">This is a button that will trigger the select</Button>}
				{...args}
			>
				{["1", "2", "3", "4"].map((option) => (
					<MultiSelectMenuItem value={option} key={option}>Option #{option}</MultiSelectMenuItem>
				))}
			</FormInvisibleMultiSelect>
		</FormContainer>
	);
};

export const ControlledFormSelect = Controlled.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
ControlledFormSelect.args = {
	label: 'Controlled Invisible Multi Select input',
};
