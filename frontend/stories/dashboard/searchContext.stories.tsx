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
import { SearchContext, SearchContextComponent } from '@controls/search/searchContext';
import { SearchInput } from '@controls/search/searchInput';

export default {
	title: 'Dashboard/SearchContext',
	component: SearchContextComponent,
	argTypes: {
		items: { control: 'object' },
	},
} as ComponentMeta<typeof SearchContextComponent>;

const Template: ComponentStory<typeof SearchContextComponent> = (args) => (
	<SearchContextComponent {...args}>
		<SearchInput placeholder="Enter here the filter term" />
		<SearchContext.Consumer>
			{(value) => (
				<h1>{JSON.stringify(value)}</h1>
			)}
		</SearchContext.Consumer>
	</SearchContextComponent>
);

export const ListWithFilteredItems = Template.bind({});
ListWithFilteredItems.args = {
	items: [{ name: 'winona' }, { name: 'David' }, { name: 'millie' }],
};
