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
import { Trans } from '@lingui/react';
import Divider from '@material-ui/core/Divider';

import AddCircleIcon from '@assets/icons/add_circle.svg';
import { DashboardListEmptyText } from '@components/dashboard/dashboardList/dasboardList.styles';
import { ContainersHooksSelectors } from '@/v5/services/selectorsHooks/containersSelectors.hooks';
import { ContainersActionsDispatchers } from '@/v5/services/actionsDispatchers/containersActions.dispatchers';
import { Button } from '@controls/button';
import { ContainersList } from './containersList';
import { EmptySearchResults } from './containersList/emptySearchResults';
import { useContainersData } from './containers.hooks';
import {
	Container,
	Content,
} from './containers.styles';

export const Containers = (): JSX.Element => {
	const {
		filteredContainers,
		favouriteContainers,
		hasContainers,
		isListPending,
	} = useContainersData();
	const favouritesFilterQuery = ContainersHooksSelectors.selectFavouritesFilterQuery();
	const allFilterQuery = ContainersHooksSelectors.selectAllFilterQuery();
	const { setFavouritesFilterQuery, setAllFilterQuery } = ContainersActionsDispatchers;

	return (
		<Container>
			<Content>
				<ContainersList
					search={{
						query: favouritesFilterQuery,
						dispatcher: setFavouritesFilterQuery,
					}}
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
						favouritesFilterQuery && hasContainers.favourites ? (
							<EmptySearchResults searchPhrase={favouritesFilterQuery} />
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
					search={{
						query: allFilterQuery,
						dispatcher: setAllFilterQuery,
					}}
					containers={filteredContainers}
					title={(
						<Trans
							id="containers.all.collapseTitle"
							message="All containerss"
						/>
					)}
					titleTooltips={{
						collapsed: <Trans id="containers.all.collapse.tooltip.show" message="Show all" />,
						visible: <Trans id="containers.all.collapse.tooltip.hide" message="Hide all" />,
					}}
					emptyMessage={
						allFilterQuery && hasContainers.all ? (
							<EmptySearchResults searchPhrase={allFilterQuery} />
						) : (
							<>
								<DashboardListEmptyText>
									<Trans id="containers.all.emptyMessage" message="You haven’t created any Containers." />
								</DashboardListEmptyText>
								<Button
									startIcon={<AddCircleIcon />}
									variant="contained"
									color="primary"
									disabled={isListPending}
								>
									<Trans id="containers.all.newContainer" message="New Container" />
								</Button>
							</>
						)
					}
				/>
			</Content>
		</Container>
	);
};
