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
import { isEmpty } from 'lodash';
import { i18n } from '@lingui/core';
import { Trans } from '@lingui/react';
import { Tooltip } from '@material-ui/core';
import { DEFAULT_SORT_CONFIG } from '@/v5/ui/routes/dashboard/projects/containers/containersList/containersList.constants';
import { SkeletonListItem } from '@/v5/ui/routes/dashboard/projects/containers/containersList/skeletonListItem';
import { Highlight } from '@controls/highlight';
import { FavouriteCheckbox } from '@controls/favouriteCheckbox';
import { EllipsisButtonWithMenu } from '@controls/ellipsisButtonWithMenu';
import { useOrderedList } from '@/v5/ui/routes/dashboard/projects/containers/containersList/containersList.hooks';
import { IContainer } from '@/v5/store/containers/containers.types';
import {
	DashboardList,
	DashboardListCollapse,
	DashboardListEmptyContainer,
	DashboardListHeader,
	DashboardListHeaderLabel,
	DashboardListItem,
} from '@components/dashboard/dashboardList';
import {
	DashboardListItemButton,
	DashboardListItemIcon,
	DashboardListItemRow,
	DashboardListItemText,
	DashboardListItemTitle,
} from '@components/dashboard/dashboardList/dashboardListItem/components';
import { IFederation } from '@/v5/store/federations/federations.types';
import { SearchInput } from '@controls/searchInput';
import { SearchInputConfig, useSearchInput } from '@controls/searchInput/searchInput.hooks';
import { EmptySearchResults } from '@/v5/ui/routes/dashboard/projects/containers/containersList/emptySearchResults';
import { FederationsActionsDispatchers } from '@/v5/services/actionsDispatchers/federationsActions.dispatchers';
import { Container } from './federationsList.styles';
import { getFederationMenuItems } from './federationsList.helpers';

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
	teamspace: string;
	project: string;
};

export const FederationsList = ({
	emptyMessage,
	federations,
	title,
	titleTooltips,
	search,
	hasFederations,
	teamspace,
	project,
}: IFederationsList): JSX.Element => {
	const { sortedList, setSortConfig } = useOrderedList(federations, DEFAULT_SORT_CONFIG);
	const {
		setSearchInput,
		searchInput,
		filterQuery,
	} = useSearchInput(search);
	const isListPending = false;

	const toggleFavourite = (id: IContainer['_id'], value: boolean) => {
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
				isLoading={isListPending}
				sideElement={(
					<Trans
						id="containers.search.placeholder"
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
								isListPending
									? <SkeletonListItem delay={index / 10} key={federation._id} />
									: (
										<DashboardListItem
											key={federation._id}
										>
											<DashboardListItemRow>
												<DashboardListItemTitle
													tooltipTitle={
														<Trans id="federations.list.item.title.tooltip" message="Launch in Viewer" />
													}
													subtitle={federation.code}
												>
													<Highlight search={filterQuery}>
														{federation.name}
													</Highlight>
												</DashboardListItemTitle>
												<DashboardListItemButton
													onClick={() => {
														// eslint-disable-next-line no-console
														console.log('handle issues button');
													}}
													width={165}
													tooltipTitle={
														<Trans id="federations.list.item.issues.tooltip" message="View issues" />
													}
												>
													<Trans
														id="federations.list.item.issues"
														message="{count} issues"
														values={{ count: federation.issues }}
													/>
												</DashboardListItemButton>
												<DashboardListItemButton
													onClick={() => {
														// eslint-disable-next-line no-console
														console.log('handle risks button');
													}}
													width={165}
													tooltipTitle={
														<Trans id="federations.list.item.risks.tooltip" message="View risks" />
													}
												>
													<Trans
														id="federations.list.item.risks"
														message="{count} risks"
														values={{ count: federation.risks }}
													/>
												</DashboardListItemButton>
												<DashboardListItemButton
													onClick={() => {
														// eslint-disable-next-line no-console
														console.log('handle containers button');
													}}
													width={165}
													tooltipTitle={
														<Trans id="federations.list.item.containers.tooltip" message="View containers" />
													}
												>
													<Trans
														id="federations.list.item.containers"
														message="{count} containers"
														values={{ count: federation.containers }}
													/>
												</DashboardListItemButton>
												<DashboardListItemText width={188}>
													<Highlight search={filterQuery}>
														{federation.category}
													</Highlight>
												</DashboardListItemText>
												<DashboardListItemText width={97}>
													{federation.lastUpdated ? i18n.date(federation.lastUpdated) : ''}
												</DashboardListItemText>
												<DashboardListItemIcon>
													<Tooltip
														title={
															<Trans id="federations.list.item.favourite.tooltip" message="Add to favourites" />
														}
													>
														<FavouriteCheckbox
															checked={federation.isFavourite}
															onClick={(event) => {
																event.stopPropagation();
															}}
															onChange={(event) => {
																toggleFavourite(
																	federation._id,
																	!!event.currentTarget.checked,
																);
															}}
														/>
													</Tooltip>
												</DashboardListItemIcon>
												<DashboardListItemIcon>
													<EllipsisButtonWithMenu
														list={getFederationMenuItems(federation._id)}
													/>
												</DashboardListItemIcon>
											</DashboardListItemRow>
										</DashboardListItem>
									)
							))
						) : (
							<DashboardListEmptyContainer>
								{ filterQuery && hasFederations ? (
									<EmptySearchResults searchPhrase={filterQuery} />
								) : emptyMessage }
							</DashboardListEmptyContainer>
						)}
					</DashboardList>
				), [sortedList, filterQuery])}
			</DashboardListCollapse>
		</Container>
	);
};
