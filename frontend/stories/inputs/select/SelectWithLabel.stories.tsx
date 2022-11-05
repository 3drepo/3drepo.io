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
import { SelectWithLabel } from '@controls/searchSelect/searchSelect.component';
import { MenuItem } from '@mui/material';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { FormContainer } from '../FormInput.styles';

export default {
	title: 'Inputs/Select/SelectWithLabel',
	argTypes: {
		label: {
			type: 'string',
		},
		error: {
			type: 'boolean',
		},
		helperText: {
			type: 'string',
		},
		required: {
			type: 'boolean',
		},
		disabled: {
			type: 'boolean',
		},
		values: {
			control: 'array',
		},
	},
	component: SelectWithLabel,
	parameters: { controls: { exclude: ['control', 'margin', 'hiddenLabel', 'ref'] } },
} as ComponentMeta<typeof SelectWithLabel>;

const Controlled: ComponentStory<typeof SelectWithLabel> = ({ values, ...args }: any) => (
	<FormContainer>
		<SelectWithLabel
			name="select"
			{...args}
		>
			{values.map((value) => (
				<MenuItem value={value} key={value} style={{ padding: '8px 14px' }}>
					{value}
				</MenuItem>
			))}
		</SelectWithLabel>
	</FormContainer>
);

export const SelectWithLabelExample = Controlled.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
SelectWithLabelExample.args = {
	label: 'Just a select with a label and error',
	values: ['value 1', 'value 2', 'value 3', 'Longer value 4'],
};
