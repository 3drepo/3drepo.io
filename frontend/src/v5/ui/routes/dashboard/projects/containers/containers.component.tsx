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

import React, { useState } from 'react';

import AddCircleIcon from '@assets/icons/add_circle.svg';
import { FormattedMessage } from 'react-intl';

import { DashboardListEmptyText, Divider } from '@components/dashboard/dashboardList/dashboardList.styles';
import { DashboardSkeletonList } from '@components/dashboard/dashboardList/dashboardSkeletonList';
import { Button } from '@controls/button';
import { Content } from '@/v5/ui/routes/dashboard/projects/projects.styles';
import { DashboardListEmptySearchResults } from '@components/dashboard/dashboardList';
import { filterContainers } from '@/v5/store/containers/containers.helpers';
import { ContainersList } from './containersList';
import { SkeletonListItem } from './containersList/skeletonListItem';
import { useContainersData } from './containers.hooks';
import { Container,
} from './containers.styles';

export const Containers = (): JSX.Element => {
	const {
		containers,
		favouriteContainers,
		hasContainers,
		isListPending,
	} = useContainersData();

	const [favouritesFilterQuery, setFavouritesFilterQuery] = useState<string>('');
	const [allFilterQuery, setAllFilterQuery] = useState<string>('');

	return (
		<Container>
			<Content>
				{isListPending ? (
					<DashboardSkeletonList itemComponent={<SkeletonListItem />} />
				) : (
					<>
						<ContainersList
							hasContainers={hasContainers.favourites}
							filterQuery={favouritesFilterQuery}
							onFilterQueryChange={setFavouritesFilterQuery}
							containers={filterContainers(favouriteContainers, favouritesFilterQuery)}
							title={(
								<FormattedMessage
									id="containers.favourites.collapseTitle"
									defaultMessage="Favourites"
								/>
							)}
							titleTooltips={{
								collapsed: <FormattedMessage id="containers.favourites.collapse.tooltip.show" defaultMessage="Show favourites" />,
								visible: <FormattedMessage id="containers.favourites.collapse.tooltip.hide" defaultMessage="Hide favourites" />,
							}}
							emptyMessage={
								favouritesFilterQuery && hasContainers.favourites ? (
									<DashboardListEmptySearchResults searchPhrase={favouritesFilterQuery} />
								) : (
									<DashboardListEmptyText>
										<FormattedMessage
											id="containers.favourites.emptyMessage"
											defaultMessage="You haven’t added any Favourites. Click the star on a container to add your first favourite Container."
										/>
									</DashboardListEmptyText>
								)
							}
						/>
						<Divider />
						<ContainersList
							filterQuery={allFilterQuery}
							onFilterQueryChange={setAllFilterQuery}
							hasContainers={hasContainers.all}
							containers={filterContainers(containers, allFilterQuery)}
							title={(
								<FormattedMessage
									id="containers.all.collapseTitle"
									defaultMessage="All containers"
								/>
							)}
							titleTooltips={{
								collapsed: <FormattedMessage id="containers.all.collapse.tooltip.show" defaultMessage="Show all" />,
								visible: <FormattedMessage id="containers.all.collapse.tooltip.hide" defaultMessage="Hide all" />,
							}}
							showBottomButton
							emptyMessage={
								allFilterQuery && hasContainers.all ? (
									<DashboardListEmptySearchResults searchPhrase={allFilterQuery} />
								) : (
									<>
										<DashboardListEmptyText>
											<FormattedMessage id="containers.all.emptyMessage" defaultMessage="You haven’t created any Containers." />
										</DashboardListEmptyText>
										<Button
											startIcon={<AddCircleIcon />}
											variant="contained"
											color="primary"
										>
											<FormattedMessage id="containers.all.newContainer" defaultMessage="New Container" />
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
