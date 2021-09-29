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
import { isEmpty } from 'lodash';
import { Trans } from '@lingui/react';
import { i18n } from '@lingui/core';
import { Tooltip } from '@material-ui/core';
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
import { FavouriteCheckbox } from '@controls/favouriteCheckbox';
import { EllipsisButtonWithMenu } from '@controls/ellipsisButtonWithMenu';
import { IContainer } from '@/v5/store/containers/containers.types';
import { getContainerMenuItems } from '@/v5/ui/routes/dashboard/projects/containers/containersList/containersList.helpers';
import { ContainersHooksSelectors } from '@/v5/services/selectorsHooks/containersSelectors.hooks';
import { Highlight } from '@controls/highlight';
import { useOrderedList } from './containersList.hooks';
import { Container } from './containersList.styles';
import { DEFAULT_SORT_CONFIG } from './containersList.constants';

type IContainersList = {
	emptyMessage: ReactNode;
	containers: IContainer[];
	title: ReactNode;
	titleTooltips: {
		collapsed: ReactNode;
		visible: ReactNode;
	},
};

export const ContainersList = ({
	containers,
	emptyMessage,
	title,
	titleTooltips,
}: IContainersList): JSX.Element => {
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const { sortedList, setSortConfig } = useOrderedList(containers, DEFAULT_SORT_CONFIG);
	const filterQuery = ContainersHooksSelectors.selectFilterQuery();

	const toggleSelectedId = (id: IContainer['_id']) => {
		setSelectedId((state) => (state === id ? null : id));
	};

	return useMemo(() => (
		<Container>
			<DashboardListCollapse
				title={title}
				tooltipTitles={titleTooltips}
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
				<DashboardList>
					{!isEmpty(sortedList) ? (
						sortedList.map((container) => (
							<DashboardListItem
								selected={container._id === selectedId}
								onClick={() => toggleSelectedId(container._id)}
								key={container._id}
							>
								<DashboardListItemRow>
									<DashboardListItemTitle
										subtitle={(
											<Trans
												id="containers.list.item.subtitle"
												message="Latest revision: {revision}"
												values={{ revision: container.latestRevision }}
											/>
										)}
										selected={container._id === selectedId}
										tooltipTitle={
											<Trans id="containers.list.item.title.tooltip" message="Launch latest revision" />
										}
									>
										<Highlight search={filterQuery}>
											{container.name}
										</Highlight>
									</DashboardListItemTitle>
									<DashboardListItemButton
										onClick={() => {
											// eslint-disable-next-line no-console
											console.log('handle revisions button');
										}}
										width={186}
										tooltipTitle={
											<Trans id="containers.list.item.revisions.tooltip" message="View revisions" />
										}
									>
										<Trans
											id="containers.list.item.revisions"
											message="{count} revisions"
											values={{ count: container.revisionsCount }}
										/>
									</DashboardListItemButton>
									<DashboardListItemText selected={container._id === selectedId}>
										<Highlight search={filterQuery}>
											{container.code}
										</Highlight>
									</DashboardListItemText>
									<DashboardListItemText width={188} selected={container._id === selectedId}>
										<Highlight search={filterQuery}>
											{container.type}
										</Highlight>
									</DashboardListItemText>
									<DashboardListItemText width={97} selected={container._id === selectedId}>
										{i18n.date(container.lastUpdated)}
									</DashboardListItemText>
									<DashboardListItemIcon>
										<Tooltip
											title={
												<Trans id="containers.list.item.favourite.tooltip" message="Add to favourites" />
											}
										>
											<FavouriteCheckbox
												checked={container.isFavourite}
												onClick={(event) => {
													event.stopPropagation();
												}}
												onChange={(event) => {
													// eslint-disable-next-line no-console
													console.log('handle favourite click', event.target.value);
												}}
											/>
										</Tooltip>
									</DashboardListItemIcon>
									<DashboardListItemIcon
										selected={container._id === selectedId}
									>
										<EllipsisButtonWithMenu list={getContainerMenuItems(container._id)} />
									</DashboardListItemIcon>
								</DashboardListItemRow>
							</DashboardListItem>
						))
					) : (
						<DashboardListEmptyContainer>
							{emptyMessage}
						</DashboardListEmptyContainer>
					)}
				</DashboardList>
			</DashboardListCollapse>
		</Container>
	), [sortedList, selectedId]);
};
