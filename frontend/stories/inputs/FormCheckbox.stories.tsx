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
import { FormCheckbox } from '@controls/formCheckbox/formCheckbox.component';
import { useForm } from 'react-hook-form';

interface IFormCheckboxInput {
	checkbox: boolean;
}

export default {
	title: 'Inputs/FormCheckbox',
	argTypes: {
		label: {
			type: 'string',
		},
		defaultValue: {
			type: 'boolean',
		},
	},
	component: FormCheckbox,
	parameters: { controls: { exclude: ['control', 'formError'] } },
} as ComponentMeta<typeof FormCheckbox>;

const Controlled: ComponentStory<typeof FormCheckbox> = (args) => {
	const {
		control,
	} = useForm<IFormCheckboxInput>({
		mode: 'onChange',
	});

	return (
		<FormCheckbox
			name="checkbox"
			control={control}
			{...args}
		/>
	);
};

export const ControlledFormCheckbox = Controlled.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
ControlledFormCheckbox.args = {
	label: 'Controlled Checkbox input',
};
