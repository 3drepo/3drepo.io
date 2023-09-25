/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import { StoryObj, Meta } from '@storybook/react';
import { SearchInput } from '@controls/search/searchInput';
import { useState } from 'react';
import { SearchContextComponent } from '@controls/search/searchContext';

export default {
	title: 'Inputs/Textfield/SearchInput',
	component: SearchInput,
	argTypes: {
		variant: {
			options: ['filled', 'outlined'],
			control: { type: 'select' },
		},
	},
	parameters: { controls: { exclude: ['ref', 'hiddenLabel', 'onClear'] } },
	decorators: [
		(Story) => (
			<SearchContextComponent fieldsToFilter={[]} items={[]}>
				<Story />
			</SearchContextComponent>
		),
	],
} as Meta<typeof SearchInput>;

type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
	args: {
		label: 'Search input',
	},
};

export const ControlledSearchInput: Story = {
	args: {
		label: 'Controlled Search input',
	},
	render: (args) => {
		const [val, setVal] = useState('');
		const onChange = (event) => setVal(event.target.value);
	
		return (<SearchInput {...args} onChange={onChange} value={val} />);
	},
};
