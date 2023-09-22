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
import { MenuItem } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react';
import { EventControllerMultipleValuesDecorator, FormDecorator } from '../inputDecorators';

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
	args: {
		label: 'Select  search',
		values: ['value 1', 'value 2', 'value 3', 'Longer value 4'],
	},
	component: SearchSelect,
	parameters: { controls: { exclude: ['margin', 'hiddenLabel', 'ref'] } },
	decorators: [FormDecorator],
} as Meta<typeof SearchSelect>;

type Story = StoryObj<typeof SearchSelect>;

export const SearchSingleSelect: Story = {
	render: ({ values, ...args }: any) => (
		<SearchSelect {...args}>
			{values.map((value) => (
				<MenuItem value={value} key={value} style={{ padding: '8px 14px' }}>
					{value}
				</MenuItem>
			))}
		</SearchSelect>
	),
};

export const SearchMultiSelect: Story = {
	args: {
		multiple: true,
		renderValue: (val: any[]) => val.join(', '),
	},
	decorators: [EventControllerMultipleValuesDecorator],
	render: ({ values, ...args }) => (
		<SearchSelect {...args} value={[]}>
			{values.map((valueItem) => (
				<MultiSelectMenuItem value={valueItem} key={valueItem}>
					{valueItem}
				</MultiSelectMenuItem>
			))}
		</SearchSelect>
	),
};
