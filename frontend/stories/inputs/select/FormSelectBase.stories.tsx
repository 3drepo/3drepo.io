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
import { FormSelectBase } from '@controls/formSelect/formSelectBase/formSelectBase.component';
import { MenuItem } from '@mui/material';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { FormContainer } from '../FormInput.styles';

export default {
	title: 'Inputs/Select/FormSelectBase',
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
		formError: {
			type: 'string',
		},
		disabled: {
			type: 'boolean',
		},
	},
	component: FormSelectBase,
	parameters: { controls: { exclude: ['control', 'ref'] } },
} as ComponentMeta<typeof FormSelectBase>;

const Controlled: ComponentStory<typeof FormSelectBase> = ({ formError, values, ...args }: any) => {
	const { control } = useForm({ mode: 'onChange' });

	return (
		<FormContainer>
			<FormSelectBase
				name="select"
				control={control}
				{...args}
				formError={formError ? { message: formError } : null}
			>
				{values.map((value) => (
					<MenuItem value={value} key={value} style={{ padding: '8px 14px' }}>
						{value}
					</MenuItem>
				))}
			</FormSelectBase>
		</FormContainer>
	);
};

export const ControlledFormSelectBase = Controlled.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
ControlledFormSelectBase.args = {
	label: 'Controlled Select input',
	values: ['value 1', 'value 2', 'value 3', 'Longer value 4'],
};
