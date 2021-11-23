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

import React, { ReactNode, useMemo } from 'react';
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
import { IFederation } from '@/v5/store/federations/federations.types';
import { SearchInput } from '@controls/searchInput';
import { SearchInputConfig, useSearchInput } from '@controls/searchInput/searchInput.hooks';
import { FederationsActionsDispatchers } from '@/v5/services/actionsDispatchers/federationsActions.dispatchers';
import AddCircleIcon from '@assets/icons/add_circle.svg';
import { FederationListItem } from '@/v5/ui/routes/dashboard/projects/federations/federationsList/federationListItem';
import { FederationsHooksSelectors } from '@/v5/services/selectorsHooks/federationsSelectors.hooks';
import { DEFAULT_SORT_CONFIG, useOrderedList } from '@components/dashboard/dashboardList/useOrderedList';
import { Button } from '@controls/button';
import { DashboardListButton } from '@components/dashboard/dashboardList/dashboardList.styles';
import { CollapseSideElementGroup, Container } from './federationsList.styles';

type IFederationsList = {
	emptyMessage: ReactNode;
	federations: IFederation[];
	title: ReactNode;
	titleTooltips: {
		collapsed: ReactNode;
		visible: ReactNode;
	},
	search: SearchInputConfig;
	hasFederations: boolean;
	showBottomButton?: boolean;
};

export const FederationsList = ({
	emptyMessage,
	federations,
	title,
	titleTooltips,
	search,
	showBottomButton = false,
	hasFederations,
}: IFederationsList): JSX.Element => {
	const { teamspace, project } = useParams() as { teamspace: string, project: string };

	const { sortedList, setSortConfig } = useOrderedList(federations, DEFAULT_SORT_CONFIG);
	const {
		setSearchInput,
		searchInput,
		filterQuery,
	} = useSearchInput(search);
	const isListPending = FederationsHooksSelectors.selectIsListPending();
	const areStatsPending = FederationsHooksSelectors.selectAreStatsPending();

	const setFavourite = (id: string, value: boolean) => {
		if (value) {
			FederationsActionsDispatchers.addFavourite(teamspace, project, id);
		} else {
			FederationsActionsDispatchers.removeFavourite(teamspace, project, id);
		}
	};

	return (
		<Container>
			<DashboardListCollapse
				title={<>{title} {!isListPending && `(${federations.length})`}</>}
				tooltipTitles={titleTooltips}
				isLoading={areStatsPending}
				sideElement={(
					<CollapseSideElementGroup>
						<Trans
							id="federations.search.placeholder"
							message="Search..."
							render={({ translation }) => (
								<SearchInput
									onClear={() => setSearchInput('')}
									onChange={(event) => setSearchInput(event.currentTarget.value)}
									value={searchInput}
									placeholder={translation as string}
								/>
							)}
						/>
						<Button
							startIcon={<AddCircleIcon />}
							variant="contained"
							color="primary"
						>
							<Trans id="federations.newFederation" message="New Federation" />
						</Button>
					</CollapseSideElementGroup>
				)}
			>
				<DashboardListHeader onSortingChange={setSortConfig} defaultSortConfig={DEFAULT_SORT_CONFIG}>
					<DashboardListHeaderLabel name="name">
						<Trans id="federations.list.header.federation" message="Federation" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="issues" width={165}>
						<Trans id="federations.list.header.issues" message="Open issues" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="risks" width={165}>
						<Trans id="federations.list.header.risks" message="Open risks" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="containers" width={165}>
						<Trans id="federations.list.header.containers" message="Containers" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="category" width={188}>
						<Trans id="federations.list.header.category" message="Category" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="lastUpdated" width={180}>
						<Trans id="federations.list.header.lastUpdated" message="Last updated" />
					</DashboardListHeaderLabel>
				</DashboardListHeader>
				{useMemo(() => (
					<DashboardList>
						{!isEmpty(sortedList) ? (
							sortedList.map((federation, index) => (
								<FederationListItem
									index={index}
									key={federation._id}
									federation={federation}
									filterQuery={filterQuery}
									onFavouriteChange={setFavourite}
								/>
							))
						) : (
							<DashboardListEmptyContainer>
								{filterQuery && hasFederations ? (
									<DashboardListEmptySearchResults searchPhrase={filterQuery} />
								) : emptyMessage}
							</DashboardListEmptyContainer>
						)}
					</DashboardList>
				), [sortedList, filterQuery])}
				{showBottomButton && !isListPending && hasFederations && (
					<DashboardListButton
						startIcon={<AddCircleIcon />}
						onClick={() => {
							// eslint-disable-next-line no-console
							console.log('->  handle add federation');
						}}
					>
						<Trans id="federations.addFederationButton" message="Add new Federation" />
					</DashboardListButton>
				)}
			</DashboardListCollapse>
		</Container>
	);
};
