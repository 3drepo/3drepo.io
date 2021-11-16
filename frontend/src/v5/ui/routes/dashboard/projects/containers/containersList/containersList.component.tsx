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

import React, { ReactNode, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { isEmpty } from 'lodash';
import { Trans } from '@lingui/react';
import {
	DashboardList,
	DashboardListCollapse,
	DashboardListEmptyContainer,
	DashboardListEmptySearchResults,
	DashboardListHeader,
	DashboardListHeaderLabel,
} from '@components/dashboard/dashboardList';
import AddCircleIcon from '@assets/icons/add_circle.svg';
import ArrowUpCircleIcon from '@assets/icons/arrow_up_circle.svg';
import { HeaderButtonsGroup } from '@/v5/ui/routes/dashboard/projects/containers/containers.styles';
import { IContainer } from '@/v5/store/containers/containers.types';
import { SearchInput } from '@controls/searchInput';
import { SearchInputConfig, useSearchInput } from '@controls/searchInput/searchInput.hooks';
import { Button } from '@controls/button';
import { DashboardListButton } from '@components/dashboard/dashboardList/dasboardList.styles';
import { ContainersHooksSelectors } from '@/v5/services/selectorsHooks/containersSelectors.hooks';
import { ContainersActionsDispatchers } from '@/v5/services/actionsDispatchers/containersActions.dispatchers';
import { ContainerListItem } from '@/v5/ui/routes/dashboard/projects/containers/containersList/containerListItem';
import { SkeletonListItem } from '@/v5/ui/routes/dashboard/projects/containers/containersList/skeletonListItem';
import { useOrderedList } from './containersList.hooks';
import { Container, CollapseSideElementGroup } from './containersList.styles';
import { DEFAULT_SORT_CONFIG } from './containersList.constants';

type IContainersList = {
	emptyMessage: ReactNode;
	containers: IContainer[];
	title: ReactNode;
	titleTooltips: {
		collapsed: ReactNode;
		visible: ReactNode;
	},
	search: SearchInputConfig;
	hasContainers: boolean;
	showBottomButton?: boolean;
};

export const ContainersList = ({
	containers,
	emptyMessage,
	title,
	titleTooltips,
	search,
	hasContainers,
	showBottomButton = false,
}: IContainersList): JSX.Element => {
	const { teamspace, project } = useParams() as { teamspace: string, project: string };
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const { sortedList, setSortConfig } = useOrderedList(containers, DEFAULT_SORT_CONFIG);
	const { searchInput, setSearchInput, filterQuery } = useSearchInput(search);
	const isListPending = ContainersHooksSelectors.selectIsListPending();
	const areStatsPending = ContainersHooksSelectors.selectAreStatsPending();

	const toggleSelectedId = (id: IContainer['_id']) => {
		setSelectedId((state) => (state === id ? null : id));
	};

	const setFavourite = (id: string, value: boolean) => {
		if (value) {
			ContainersActionsDispatchers.addFavourite(teamspace, project, id);
		} else {
			ContainersActionsDispatchers.removeFavourite(teamspace, project, id);
		}
	};

	return (
		<Container>
			<DashboardListCollapse
				title={<>{title} {!isListPending && `(${containers.length})`}</>}
				tooltipTitles={titleTooltips}
				isLoading={areStatsPending}
				sideElement={(
					<CollapseSideElementGroup>
						<Trans
							id="containers.search.placeholder"
							message="Search containers..."
							render={({ translation }) => (
								<SearchInput
									onClear={() => setSearchInput('')}
									onChange={(event) => setSearchInput(event.currentTarget.value)}
									value={searchInput}
									placeholder={translation as string}
								/>
							)}
						/>
						<HeaderButtonsGroup>
							<Button
								startIcon={<AddCircleIcon />}
								variant="outlined"
								color="secondary"
							>
								<Trans id="containers.mainHeader.newContainer" message="New container" />
							</Button>
							<Button
								startIcon={<ArrowUpCircleIcon />}
								variant="contained"
								color="primary"
							>
								<Trans id="containers.mainHeader.uploadFiles" message="Upload files" />
							</Button>
						</HeaderButtonsGroup>
					</CollapseSideElementGroup>
				)}
			>
				<DashboardListHeader onSortingChange={setSortConfig} defaultSortConfig={DEFAULT_SORT_CONFIG}>
					<DashboardListHeaderLabel name="name">
						<Trans id="containers.list.header.container" message="Container" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="revisionsCount" width={186}>
						<Trans id="containers.list.header.revisions" message="Revisions" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="code">
						<Trans id="containers.list.header.containerCode" message="Container code" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="type" width={188}>
						<Trans id="containers.list.header.category" message="Category" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="lastUpdated" width={180}>
						<Trans id="containers.list.header.lastUpdated" message="Last updated" />
					</DashboardListHeaderLabel>
				</DashboardListHeader>
				{useMemo(() => (
					<DashboardList>
						{!isEmpty(sortedList) ? (
							sortedList.map((container, index) => (
								container.hasStatsPending ? (
									<SkeletonListItem key={container._id} delay={index / 10} />
								) : (
									<ContainerListItem
										key={container._id}
										isSelected={container._id === selectedId}
										container={container}
										filterQuery={filterQuery}
										onFavouriteChange={setFavourite}
										onToggleSelected={toggleSelectedId}
									/>
								)))
						) : (
							<DashboardListEmptyContainer>
								{filterQuery && hasContainers ? (
									<DashboardListEmptySearchResults searchPhrase={filterQuery} />
								) : emptyMessage}
							</DashboardListEmptyContainer>
						)}
					</DashboardList>
				), [sortedList, filterQuery])}
				{showBottomButton && !isListPending && hasContainers && (
					<DashboardListButton
						startIcon={<AddCircleIcon />}
						onClick={() => {
							// eslint-disable-next-line no-console
							console.log('->  handle add container');
						}}
					>
						<Trans id="federations.addFederationButton" message="Add new Federation" />
					</DashboardListButton>
				)}
			</DashboardListCollapse>
		</Container>
	);
};
