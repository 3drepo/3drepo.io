/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import React from 'react';
import { DashboardListEmptyText, Divider } from '@components/dashboard/dashboardList/dasboardList.styles';
import { Trans } from '@lingui/react';
import { MainHeader } from '@controls/mainHeader';
import { SearchInput } from '@controls/searchInput';
import AddCircleIcon from '@assets/icons/add_circle.svg';
import ArrowUpCircleIcon from '@assets/icons/arrow_up_circle.svg';
import { ContainersHooksSelectors } from '@/v5/services/selectorsHooks/containersSelectors.hooks';
import { useSearchInput } from '@controls/searchInput/searchInput.hooks';
import { ContainersActionsDispatchers } from '@/v5/services/actionsDispatchers/containersActions.dispatchers';
import { DashboardSkeletonList } from '@components/dashboard/dashboardList/dashboardSkeletonList';
import { SkeletonListItem } from '@/v5/ui/routes/dashboard/projects/containers/containersList/skeletonListItem';
import { Button } from '@controls/button';
import {
	Container,
	Content,
	HeaderButtonsGroup,
} from './containers.styles';
import { ContainersList } from './containersList';
import { EmptySearchResults } from './containersList/emptySearchResults';
import { useContainersData } from './containers.hooks';

export const Containers = (): JSX.Element => {
	const {
		filteredContainers,
		favouriteContainers,
		hasContainers,
		isListPending,
	} = useContainersData();

	const { searchInput, setSearchInput, filterQuery } = useSearchInput({
		query: ContainersHooksSelectors.selectFilterQuery(),
		dispatcher: ContainersActionsDispatchers.setFilterQuery,
	});

	return (
		<Container>
			<MainHeader>
				<Trans
					id="containers.search.placeholder"
					message="Search containers..."
					render={({ translation }) => (
						<SearchInput
							onClear={() => setSearchInput('')}
							onChange={(event) => setSearchInput(event.currentTarget.value)}
							value={searchInput}
							placeholder={translation as string}
							disabled={isListPending}
						/>
					)}
				/>
				<HeaderButtonsGroup>
					<Button
						startIcon={<AddCircleIcon />}
						variant="outlined"
						color="secondary"
						disabled={isListPending}
					>
						<Trans id="containers.mainHeader.newContainer" message="New Container" />
					</Button>
					<Button
						startIcon={<ArrowUpCircleIcon />}
						variant="contained"
						color="primary"
						disabled={isListPending}
					>
						<Trans id="containers.mainHeader.uploadFile" message="Upload file" />
					</Button>
				</HeaderButtonsGroup>
			</MainHeader>
			<Content>
				{isListPending ? (
					<DashboardSkeletonList itemComponent={<SkeletonListItem />} />
				) : (
					<>
						<ContainersList
							containers={favouriteContainers}
							title={(
								<Trans
									id="containers.favourites.collapseTitle"
									message="Favourites"
								/>
							)}
							titleTooltips={{
								collapsed: <Trans id="containers.favourites.collapse.tooltip.show" message="Show favourites" />,
								visible: <Trans id="containers.favourites.collapse.tooltip.hide" message="Hide favourites" />,
							}}
							emptyMessage={
								filterQuery && hasContainers.favourites ? (
									<EmptySearchResults searchPhrase={filterQuery} />
								) : (
									<DashboardListEmptyText>
										<Trans
											id="containers.favourites.emptyMessage"
											message="You haven’t added any Favourites. Click the star on a container to add your first favourite Container."
										/>
									</DashboardListEmptyText>
								)
							}
						/>
						<Divider />
						<ContainersList
							containers={filteredContainers}
							title={(
								<Trans
									id="containers.all.collapseTitle"
									message="All containers"
								/>
							)}
							titleTooltips={{
								collapsed: <Trans id="containers.all.collapse.tooltip.show" message="Show all" />,
								visible: <Trans id="containers.all.collapse.tooltip.hide" message="Hide all" />,
							}}
							emptyMessage={
								filterQuery && hasContainers.all ? (
									<EmptySearchResults searchPhrase={filterQuery} />
								) : (
									<>
										<DashboardListEmptyText>
											<Trans id="containers.all.emptyMessage" message="You haven’t created any Containers." />
										</DashboardListEmptyText>
										<Button
											startIcon={<AddCircleIcon />}
											variant="contained"
											color="primary"
										>
											<Trans id="containers.all.newContainer" message="New Container" />
										</Button>
									</>
								)
							}
						/>
					</>
				)}
			</Content>
		</Container>
	);
};
