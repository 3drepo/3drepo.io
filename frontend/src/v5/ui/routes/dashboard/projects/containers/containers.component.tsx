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

import { DashboardListEmptyText } from '@components/dashboard/dashboardList/dasboardList.styles';
import { MainHeader } from '@controls/mainHeader';
import { SearchInput } from '@controls/searchInput';
import AddCircleIcon from '@assets/icons/add_circle.svg';
import ArrowUpCircleIcon from '@assets/icons/arrow_up_circle.svg';
import { DashboardSkeletonList } from '@components/dashboard/dashboardList/dashboardSkeletonList';
import { SkeletonListItem } from '@/v5/ui/routes/dashboard/projects/containers/containersList/skeletonListItem';
import { Button } from '@controls/button';
import { FormattedMessage } from 'react-intl';
import { formatMessage } from '@/v5/services/intl';
import {
	Container,
	Content,
	HeaderButtonsGroup,
} from './containers.styles';
import { ContainersList } from './containersList';
import { EmptySearchResults } from './containersList/emptySearchResults';
import { useContainersData, useContainersSearch } from './containers.hooks';

export const Containers = (): JSX.Element => {
	const {
		filteredContainers,
		favouriteContainers,
		hasContainers,
		isListPending,
	} = useContainersData();

	const { searchInput, setSearchInput, filterQuery } = useContainersSearch();

	return (
		<Container>
			<MainHeader>
				<SearchInput
					onClear={() => setSearchInput('')}
					onChange={(event) => setSearchInput(event.currentTarget.value)}
					value={searchInput}
					placeholder={formatMessage({ id: 'containers.search.placeholder',
						defaultMessage: 'Search containers...' })}
					disabled={isListPending}
				/>
				<HeaderButtonsGroup>
					<Button
						startIcon={<AddCircleIcon />}
						variant="outlined"
						color="secondary"
						disabled={isListPending}
					>
						<FormattedMessage id="containers.mainHeader.newContainer" defaultMessage="New Container" />
					</Button>
					<Button
						startIcon={<ArrowUpCircleIcon />}
						variant="contained"
						color="primary"
						disabled={isListPending}
					>
						<FormattedMessage id="containers.mainHeader.uploadFile" defaultMessage="Upload file" />
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
								filterQuery && hasContainers.favourites ? (
									<EmptySearchResults searchPhrase={filterQuery} />
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
						<ContainersList
							containers={filteredContainers}
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
							emptyMessage={
								filterQuery && hasContainers.all ? (
									<EmptySearchResults searchPhrase={filterQuery} />
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
