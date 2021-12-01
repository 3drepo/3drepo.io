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
import {
	DashboardList,
	DashboardListCollapse,
	DashboardListEmptyContainer,
	DashboardListHeader,
	DashboardListHeaderLabel,
} from '@components/dashboard/dashboardList';
import { IContainer } from '@/v5/store/containers/containers.types';
import { ContainersHooksSelectors } from '@/v5/services/selectorsHooks/containersSelectors.hooks';
import { ContainersActionsDispatchers } from '@/v5/services/actionsDispatchers/containersActions.dispatchers';
import { ContainerListItem } from '@/v5/ui/routes/dashboard/projects/containers/containersList/containerListItem';
import { SkeletonListItem } from '@/v5/ui/routes/dashboard/projects/containers/containersList/skeletonListItem';
import { FormattedMessage } from 'react-intl';
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
	const { teamspace, project } = useParams() as { teamspace: string, project: string };
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const { sortedList, setSortConfig } = useOrderedList(containers, DEFAULT_SORT_CONFIG);
	const filterQuery = ContainersHooksSelectors.selectFilterQuery();
	const areStatsPending = ContainersHooksSelectors.selectAreStatsPending();
	const isListPending = ContainersHooksSelectors.selectIsListPending();

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

	return useMemo(() => (
		<Container>
			<DashboardListCollapse
				title={<>{title} {!isListPending && `(${containers.length})`}</>}
				tooltipTitles={titleTooltips}
				isLoading={areStatsPending}
			>
				<DashboardListHeader onSortingChange={setSortConfig} defaultSortConfig={DEFAULT_SORT_CONFIG}>
					<DashboardListHeaderLabel name="name">
						<FormattedMessage id="containers.list.header.container" defaultMessage="Container" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="revisionsCount" width={186}>
						<FormattedMessage id="containers.list.header.revisions" defaultMessage="Revisions" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="code">
						<FormattedMessage id="containers.list.header.containerCode" defaultMessage="Container code" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="type" width={188}>
						<FormattedMessage id="containers.list.header.category" defaultMessage="Category" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="lastUpdated" width={180}>
						<FormattedMessage id="containers.list.header.lastUpdated" defaultMessage="Last updated" />
					</DashboardListHeaderLabel>
				</DashboardListHeader>
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
							{emptyMessage}
						</DashboardListEmptyContainer>
					)}
				</DashboardList>
			</DashboardListCollapse>
		</Container>
	), [sortedList, selectedId, areStatsPending, isListPending]);
};
