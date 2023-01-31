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
import { MultiSelectMenuItem } from '@controls/inputs/multiSelect/multiSelectMenuItem/multiSelectMenuItem.component';
import { SearchSelect } from '@controls/searchSelect/searchSelect.component';
import { MenuItem, SelectChangeEvent } from '@mui/material';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useState } from 'react';
import { FormContainer } from '../FormInput.styles';

export default {
	title: 'Inputs/Select/SearchSelect',
	argTypes: {
		label: {
			type: 'string',
		},
		error: {
			type: 'boolean',
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
		multiple: {
			type: 'boolean',
		},
	},
	component: SearchSelect,
	parameters: { controls: { exclude: ['margin', 'hiddenLabel', 'ref'] } },
} as ComponentMeta<typeof SearchSelect>;

const Controlled: ComponentStory<typeof SearchSelect> = ({ values, ...args }: any) => (
	<FormContainer>
		<SearchSelect {...args}>
			{values.map((value) => (
				<MenuItem value={value} key={value} style={{ padding: '8px 14px' }}>
					{value}
				</MenuItem>
			))}
		</SearchSelect>
	</FormContainer>
);

export const SelectWithSearchExample = Controlled.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
SelectWithSearchExample.args = {
	label: 'Select  search',
	values: ['value 1', 'value 2', 'value 3', 'Longer value 4'],
};

const SearchSelectMultipleControlledStory: ComponentStory<typeof SearchSelect> = ({ values, ...args }: any) => {
	const [value, setValue] = useState([]);

	const handleChange = (event: SelectChangeEvent<any[]>) => {
		setValue(event.target.value as any[]);
	};

	return (
		<FormContainer>
			<SearchSelect
				{...args}
				value={value}
				onChange={handleChange}
				multiple
				renderValue={(val) => (val as any[]).join(', ')}
			>
				{values.map((valueItem) => (
					<MultiSelectMenuItem value={valueItem} key={valueItem}>
						{valueItem}
					</MultiSelectMenuItem>
				))}
			</SearchSelect>
		</FormContainer>
	);
};

export const SelectWithSearchMultiple = SearchSelectMultipleControlledStory.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
SelectWithSearchMultiple.args = {
	label: 'Select  search',
	values: ['value 1', 'value 2', 'value 3', 'Longer value 4'],
};
