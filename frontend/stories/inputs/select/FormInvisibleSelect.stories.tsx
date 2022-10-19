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
import { FormInvisibleSelect } from '@controls/formInvisibleSelect/formInvisibleSelect.component';
import { SelectMenuItem } from '@controls/formSelect/formSelectMenutItem.styles';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { FormContainer } from '../FormInput.styles';

export default {
	title: 'Inputs/Select/FormInvisibleSelect',
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
	component: FormInvisibleSelect,
	parameters: { controls: { exclude: [
		'control',
		'ref',
		'selectedOptionsTooltip',
		'onItemClick',
		'itemIsSelected',
		'TriggerComponent',
		'formError',
		'disabled',
		'label',
		'renderValueTooltip',
	] } },
} as ComponentMeta<typeof FormInvisibleSelect>;

const Controlled: ComponentStory<typeof FormInvisibleSelect> = (args) => {
	const { control } = useForm({ mode: 'onChange' });

	return (
		<FormContainer>
			<FormInvisibleSelect
				name="invisible-select"
				control={control}
				TriggerComponent={<Button variant="contained">This is a button that will trigger the select</Button>}
				{...args}
			>
				{['1', '2', '3', '4'].map((option) => (
					<SelectMenuItem value={option} key={option}>Option #{option}</SelectMenuItem>
				))}
			</FormInvisibleSelect>
		</FormContainer>
	);
};

export const ControlledFormSelect = Controlled.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
ControlledFormSelect.args = {
	label: 'Controlled Invisible Select input',
};
