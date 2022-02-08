/**
 *  Copyright (C) 2022 3D Repo Ltd
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
import { DashboardList, DashboardListCollapse, DashboardListHeader, DashboardListHeaderLabel } from '@components/dashboard/dashboardList';
import { formatMessage } from '@/v5/services/intl';
import { FormattedMessage } from 'react-intl';
import { HeaderButtonsGroup } from '@/v5/ui/routes/dashboard/projects/containers/containers.styles';
import { SearchInput } from '@controls/searchInput';
import { Display } from '@/v5/ui/themes/media';
import { DEFAULT_SORT_CONFIG, useOrderedList } from '@components/dashboard/dashboardList/useOrderedList';
import { IContainer } from '@/v5/store/containers/containers.types';
import { CollapseSideElementGroup, Container } from './editFederationContainersList.styles';
import { EditFederationContainersList } from './editFederationContainersListItem/editFederationContainersListItem.component';

type EditFederationContainersProps = {
	containers: IContainer[];
	title: string;
	collapsableTooltips?: {
		visible: ReactNode;
		collapsed: ReactNode;
	},
	emptyListMessage: ReactNode;
	actionButton: ReactNode;
	filterQuery?: string;
	onFilterQueryChange?: (query: string) => void;
};

export const EditFederationContainers = ({
	containers,
	title,
	collapsableTooltips,
	emptyListMessage,
	filterQuery,
	actionButton: buttons,
	onFilterQueryChange,
}: EditFederationContainersProps) => {
	const { sortedList, setSortConfig } = {} // useOrderedList(containers, DEFAULT_SORT_CONFIG);

	return (
		<Container>
			<DashboardListCollapse
				title={(
					<>{title} {`(${containers.length})`}</>
				)}
				tooltipTitles={collapsableTooltips}
				sideElement={(
					<CollapseSideElementGroup>
						<HeaderButtonsGroup>
							{buttons}
						</HeaderButtonsGroup>
						<SearchInput
							onClear={() => onFilterQueryChange('')}
							onChange={(event) => onFilterQueryChange(event.currentTarget.value)}
							value={filterQuery}
							placeholder={formatMessage({ id: 'modal.editFederation.included.search.placeholder', defaultMessage: 'Search containers...' })}
						/>
					</CollapseSideElementGroup>
				)}
			>
				<DashboardListHeader onSortingChange={setSortConfig} defaultSortConfig={DEFAULT_SORT_CONFIG}>
					<DashboardListHeaderLabel name="name">
						<FormattedMessage id="containers.list.header.container" defaultMessage="Container" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="revisionsCount" width={186} hideWhenSmallerThan={Display.Desktop}>
						<FormattedMessage id="containers.list.header.revisions" defaultMessage="Revisions" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="code" minWidth={112}>
						<FormattedMessage id="containers.list.header.containerCode" defaultMessage="Container code" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="type" width={188} hideWhenSmallerThan={Display.Tablet}>
						<FormattedMessage id="containers.list.header.category" defaultMessage="Category" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="lastUpdated" width={160}>
						<FormattedMessage id="containers.list.header.lastUpdated" defaultMessage="Last updated" />
					</DashboardListHeaderLabel>
				</DashboardListHeader>
				<DashboardList>
					<EditFederationContainersList
						containers={containers}
						filterQuery={filterQuery}
						emptyListMessage={emptyListMessage}
					/>
				</DashboardList>
			</DashboardListCollapse>
		</Container>
	);
};
