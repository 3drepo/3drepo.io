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
import { DashboardListCollapse, DashboardListEmptyContainer, DashboardListEmptySearchResults, DashboardListHeader, DashboardListHeaderLabel, DashboardListItem } from '@components/dashboard/dashboardList';
import { CollapseSideElementGroup } from '@/v5/ui/routes/dashboard/projects/containers/containersList/containersList.styles';
import { DashboardListItemRow, DashboardListItemText } from '@components/dashboard/dashboardList/dashboardListItem/components';
import { useContext } from 'react';

export default {
	title: 'Dashboard/SearchContext',
	component: SearchContextComponent,
	argTypes: {
		items: { control: 'object' },
	},
} as ComponentMeta<typeof SearchContextComponent>;

const ObjectsListHeader = ({ columnNames, setSortConfig }) => (
	<DashboardListHeader onSortingChange={setSortConfig}>
		{(columnNames as string[]).map((columnName) => (
			<DashboardListHeaderLabel name={columnName}>{columnName}</DashboardListHeaderLabel>
		))}
	</DashboardListHeader>
);

const ObjectsList = () => {
	const { items, filteredItems } = useContext(SearchContext);

	return (
		<DashboardListCollapse
			title={<>Searchable list</>}
			sideElement={(
				<CollapseSideElementGroup>
					<SearchInput
						placeholder="Search containers..."
					/>
				</CollapseSideElementGroup>
			)}
		>
			{items.length > 0
			&& (
				<>
					<ObjectsListHeader setSortConfig={() => { }} columnNames={Object.keys(items[0])} />
					{
						filteredItems.map((item) => (
							<DashboardListItem
								key={JSON.stringify(item)}
							>
								<DashboardListItemRow>
									{Object.keys(item).map((key) => (
										<DashboardListItemText>
											{item[key]}
										</DashboardListItemText>
									))}
								</DashboardListItemRow>
							</DashboardListItem>
						))
					}
				</>
			)}

			{filteredItems.length === 0
			&& (
				<DashboardListEmptyContainer>
					<DashboardListEmptySearchResults />
				</DashboardListEmptyContainer>
			)}

		</DashboardListCollapse>
	);
};
const Template: ComponentStory<typeof SearchContextComponent> = (args) => (
	<SearchContextComponent {...args}>
		<ObjectsList />
	</SearchContextComponent>
);

export const ListWithFilteredItems = Template.bind({});
ListWithFilteredItems.args = {
	items: [{ name: 'Winona' }, { name: 'David' }, { name: 'Millie' }],
};
