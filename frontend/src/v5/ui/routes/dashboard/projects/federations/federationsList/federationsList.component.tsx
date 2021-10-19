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

import React, { ReactNode } from 'react';
import { DEFAULT_SORT_CONFIG } from '@/v5/ui/routes/dashboard/projects/containers/containersList/containersList.constants';

import { Trans } from '@lingui/react';
import { isEmpty } from 'lodash';
import { SkeletonListItem } from '@/v5/ui/routes/dashboard/projects/containers/containersList/skeletonListItem';
import { Highlight } from '@controls/highlight';
import { i18n } from '@lingui/core';
import { Tooltip } from '@material-ui/core';
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
import { getFederationMenuItems } from '@/v5/store/federations/federations.helpers';
import { Container } from './federationsList.styles';

type IFederationsList = {
	emptyMessage: ReactNode;
	federations: IFederation[];
	title: ReactNode;
	titleTooltips: {
		collapsed: ReactNode;
		visible: ReactNode;
	},
};

export const FederationsList = ({ emptyMessage, federations, title, titleTooltips }: IFederationsList): JSX.Element => {
	const { sortedList, setSortConfig } = useOrderedList(federations, DEFAULT_SORT_CONFIG);
	const isListPending = false;

	const filterQuery = '';

	const toggleFavourite = (id: IContainer['_id'], value: boolean) => {
		if (value) {
			// ContainersActionsDispatchers.addFavourite(teamspace, project, id);
		} else {
			// ContainersActionsDispatchers.removeFavourite(teamspace, project, id);
		}
	};
	return (
		<Container>
			<DashboardListCollapse
				title={<>{title} {!isListPending && `(${federations.length})`}</>}
				tooltipTitles={titleTooltips}
				isLoading={isListPending}
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
													values={{ count: federation.subModels.length }}
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
												<EllipsisButtonWithMenu list={getFederationMenuItems(federation._id)} />
											</DashboardListItemIcon>
										</DashboardListItemRow>
									</DashboardListItem>
								)
						))
					) : (
						<DashboardListEmptyContainer>
							{emptyMessage}
						</DashboardListEmptyContainer>
					)}
				</DashboardList>
			</DashboardListCollapse>
		</Container>
	);
};
