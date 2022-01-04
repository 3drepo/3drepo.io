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
import { FormattedMessage } from 'react-intl';

import { DashboardListEmptyText, Divider } from '@components/dashboard/dashboardList/dashboardList.styles';
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
import { Content } from '@/v5/ui/routes/dashboard/projects/projects.styles';
import { DashboardListEmptySearchResults } from '@components/dashboard/dashboardList';
import { CreateContainerForm } from '@/v5/ui/routes/dashboard/projects/containers/createContainerForm/createContainerForm.component';
import { formatMessage } from '@/v5/services/intl';
import {
	Container,
	HeaderButtonsGroup,
} from './containers.styles';
import { ContainersList } from './containersList';
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

	const [newContainerFormOpen, setCreateContainerFormOpen] = useState(false);

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
						onClick={() => setCreateContainerFormOpen(true)}
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
									<DashboardListEmptySearchResults searchPhrase={filterQuery} />
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
									<DashboardListEmptySearchResults searchPhrase={filterQuery} />
								) : (
									<>
										<DashboardListEmptyText>
											<FormattedMessage id="containers.all.emptyMessage" defaultMessage="You haven’t created any Containers." />
										</DashboardListEmptyText>
										<Button
											startIcon={<AddCircleIcon />}
											variant="contained"
											color="primary"
											onClick={() => setCreateContainerFormOpen(true)}
										>
											<FormattedMessage id="containers.all.newContainer" defaultMessage="New Container" />
										</Button>
									</>
								)
							}
						/>
					</>
				)}
				<CreateContainerForm
					open={newContainerFormOpen}
					close={() => setCreateContainerFormOpen(false)}
				/>
			</Content>
		</Container>
	);
};
