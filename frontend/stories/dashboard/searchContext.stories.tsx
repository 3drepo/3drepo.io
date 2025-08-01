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

import { Meta, StoryObj } from '@storybook/react';
import { SearchContext, SearchContextComponent } from '@controls/search/searchContext';
import { DashboardListCollapse, DashboardListEmptyContainer, DashboardListEmptySearchResults, DashboardListHeader, DashboardListHeaderLabel, DashboardListItem } from '@components/dashboard/dashboardList';
import { CollapseSideElementGroup } from '@/v5/ui/routes/dashboard/projects/containers/containersList/containersList.styles';
import { useContext } from 'react';
import { DashboardListItemRow } from '@components/dashboard/dashboardList/dashboardListItem/components/dashboardListItemRow/dashboardListItemRow.component';
import { DashboardListItemText } from '@components/dashboard/dashboardList/dashboardListItem/components/dashboardListItemText/dashboardListItemText.component';
import { SearchInput } from '@controls/search/searchInput';

const meta: Meta<typeof SearchContextComponent> = {
	title: 'Dashboard/SearchContext',
	component: SearchContextComponent,
	argTypes: {
		items: { control: 'object' },
	},
	parameters: { controls: { exclude: 'children' } },
};
export default meta;

const ObjectsListHeader = ({ columnNames, setSortConfig }) => (
	<DashboardListHeader onSortingChange={setSortConfig}>
		{(columnNames as string[]).map((columnName) => (
			<DashboardListHeaderLabel name={columnName}>{columnName}</DashboardListHeaderLabel>
		))}
	</DashboardListHeader>
);

const ObjectsList = () => {
	const { filteredItems } = useContext(SearchContext);

	return (
		<DashboardListCollapse
			title={<>Searchable list</>}
			sideElement={(
				<CollapseSideElementGroup>
					<SearchInput placeholder="Search containers..." />
				</CollapseSideElementGroup>
			)}
		>
			{filteredItems.length ? (
				<>
					<ObjectsListHeader setSortConfig={() => null} columnNames={Object.keys(filteredItems[0])} />
					{filteredItems.map((item) => (
						<DashboardListItem key={item.name}>
							<DashboardListItemRow>
								{Object.keys(item).map((key) => (
									<DashboardListItemText>
										{item[key]}
									</DashboardListItemText>
								))}
							</DashboardListItemRow>
						</DashboardListItem>
					))}
				</>
			) : (
				<DashboardListEmptyContainer>
					<DashboardListEmptySearchResults />
				</DashboardListEmptyContainer>
			)}
		</DashboardListCollapse>
	);
};

type Story = StoryObj<typeof SearchContextComponent>;

export const ListWithFilteredItems: Story = {
	args: {
		items: [
			{ name: 'Winona', nationality: 'American' },
			{ name: 'David', nationality: 'American' },
			{ name: 'Millie', nationality: 'British' },
		],
		children: <ObjectsList />,
	},
};
