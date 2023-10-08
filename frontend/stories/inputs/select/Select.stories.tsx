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
import { Select } from '@controls/inputs/select/select.component';
import { MenuItem } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FormDecorator } from '../inputDecorators';
import { MultiSelectMenuItem } from '@controls/inputs/multiSelect/multiSelectMenuItem/multiSelectMenuItem.component';

export default {
	title: 'Inputs/Select/Select',
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
		multiple: {
			type: 'boolean',
		},
		values: {
			control: 'array',
		},
	},
	args: {
		label: 'Just a select with a label and error',
		values: ['value 1', 'value 2', 'value 3', 'Longer value 4'],
	},
	component: Select,
	parameters: { controls: { exclude: ['margin', 'hiddenLabel', 'ref'] } },
	decorators: [FormDecorator],
} as Meta<typeof Select & { values: any[] }>;

type Story = StoryObj<typeof Select & { values: any[] }>;

export const SingleSelect: Story = {
	render: ({ values, ...args }: any) => (
		<Select {...args}>
			{values.map((value) => (
				<MenuItem value={value} key={value} style={{ padding: '8px 14px' }}>
					{value}
				</MenuItem>
			))}
		</Select>
	),
};

export const MultiSelect: Story = {
	args: {
		multiple: true,
		value: [],
	},
	render: ({ values, value: initialValue, ...args }: any) => {
		const [value, setValue] = useState(initialValue || []);
		const handleChange = (event) => setValue(event.target.value as any);
		return (
			<Select {...args} value={value} onChange={handleChange}>
				{values.map((valueItem) => (
					<MultiSelectMenuItem value={valueItem} key={valueItem}>
						{valueItem}
					</MultiSelectMenuItem>
				))}
			</Select>
		);
	},
};
