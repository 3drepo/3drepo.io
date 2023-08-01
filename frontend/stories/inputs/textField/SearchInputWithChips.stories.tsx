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
import { SearchInputWithChips } from '@controls/search/searchInput/searchInputWithChips.component';
import { useState } from 'react';
import { SearchContextComponent } from '@controls/search/searchContext';

export default {
	title: 'Inputs/Textfield/SearchInputWithChips',
	component: SearchInputWithChips,
	argTypes: {
		variant: {
			options: ['filled', 'outlined'],
			control: { type: 'select' },
		},
	},
	parameters: { controls: { exclude: ['ref', 'hiddenLabel', 'onClear'] } },
} as ComponentMeta<typeof SearchInputWithChips>;

const Template: ComponentStory<typeof SearchInputWithChips> = (args) => (
	<SearchContextComponent fieldsToFilter={[]} items={[]}>
		<SearchInputWithChips {...args} />
	</SearchContextComponent>
);

export const Default = Template.bind({});
Default.args = {
	label: 'Search input',
};

const Controlled: ComponentStory<typeof SearchInputWithChips> = (args) => {
	const [vals, setVals] = useState([]);

	const onChange = (event, newVals) => setVals(newVals);

	const onRemoveChip = (index) => setVals(vals.filter((_, idx) => idx !== index));

	return (<SearchInputWithChips {...args} onChange={onChange} onRemoveChip={onRemoveChip} value={vals} />);
};

export const ControlledSearchInputWithChips = Controlled.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
ControlledSearchInputWithChips.args = {
	label: 'Controlled Search input',
};
