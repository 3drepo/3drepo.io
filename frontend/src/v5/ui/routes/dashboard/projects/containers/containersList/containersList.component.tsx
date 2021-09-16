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

import React, { ReactNode, useState } from 'react';
import { isEmpty } from 'lodash';
import { Trans } from '@lingui/react';
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
import { Container } from './containersList.styles';

type IContainersList = {
	emptyMessage: ReactNode;
	containers: Array<any>;
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

	const onSortingChanged = () => {
	};

	return (
		<Container>
			<DashboardListCollapse
				title={title}
				tooltipTitles={titleTooltips}
			>
				<DashboardListHeader onSortingChange={onSortingChanged}>
					<DashboardListHeaderLabel name="container" sort>
						<Trans id="containers.list.header.container" message="Container" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="revision" width={186} sort>
						<Trans id="containers.list.header.revisions" message="Revisions" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="code" sort>
						<Trans id="containers.list.header.containerCode" message="Container code" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="category" width={188} sort>
						<Trans id="containers.list.header.category" message="Category" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel width={180} sort>
						<Trans id="containers.list.header.lastUpdated" message="Last updated" />
					</DashboardListHeaderLabel>
				</DashboardListHeader>
				<DashboardList>
					{!isEmpty(containers) ? (
						containers.map((container) => (
							<DashboardListItem
								selected={container._id === selectedId}
								onClick={() => setSelectedId(container._id)}
								key={container.id}
							>
								<DashboardListItemRow>
									<DashboardListItemTitle
										subtitle={`Latest revision ${container.latestRevision}`}
										selected={container._id === selectedId}
										tooltipTitle="Title tooltip"
									>
										{container.title}
									</DashboardListItemTitle>
									<DashboardListItemButton
										onClick={() => {
											// eslint-disable-next-line no-console
											console.log('handle revisions button');
										}}
										width={186}
										tooltipTitle="View revisions"
									>
										{`${container.revisionsCount} revisions`}
									</DashboardListItemButton>
									<DashboardListItemText selected={container._id === selectedId}>
										{container.code}
									</DashboardListItemText>
									<DashboardListItemText width={188} selected={container._id === selectedId}>
										{container.category}
									</DashboardListItemText>
									<DashboardListItemText width={97} selected={container._id === selectedId}>
										{container.date}
									</DashboardListItemText>
									<DashboardListItemIcon>
										<FavouriteCheckbox
											onClick={(event) => {
												event.stopPropagation();
												// eslint-disable-next-line no-console
												console.log('handle favourite click');
											}}
										/>
									</DashboardListItemIcon>
									<DashboardListItemIcon><FavouriteCheckbox /></DashboardListItemIcon>
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
	);
};
