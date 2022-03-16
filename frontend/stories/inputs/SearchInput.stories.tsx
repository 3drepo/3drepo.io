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
import { SearchInput } from '@controls/searchInput';
import { useState } from 'react';

export default {
	title: 'Inputs/SearchInput',
	component: SearchInput,
	parameters: { controls: { exclude: ['ref', 'hiddenLabel'] } },
} as ComponentMeta<typeof SearchInput>;

const Template: ComponentStory<typeof SearchInput> = (args) =>
	<SearchInput {...args} />;

export const Default = Template.bind({});
Default.args = {
	label: 'Search input',
};

const Controlled: ComponentStory<typeof SearchInput> = (args) => {
	const [val, setVal] = useState('');

	const onChange = (event) => {
		setVal(event.target.value);
	};

	return (<SearchInput {...args} onChange={onChange} value={val} />);
};

export const ControlledSearchInput = Controlled.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
ControlledSearchInput.args = {
	label: 'Controlled Search input',
};
