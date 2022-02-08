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
import { isEmpty } from 'lodash';
import { IContainer } from '@/v5/store/containers/containers.types';
import { DashboardListEmptyContainer, DashboardListEmptySearchResults } from '@components/dashboard/dashboardList';
import { DashboardListEmptyText } from '@components/dashboard/dashboardList/dashboardList.styles';

type EditFederationContainersListProps = {
	containers: IContainer[];
	filterQuery?: string;
	emptyListMessage: ReactNode;
};

export const EditFederationContainersList = ({
	containers,
	filterQuery,
	emptyListMessage,
}: EditFederationContainersListProps) => (
	<>
		{!isEmpty(containers) ? (
			containers.map((container, index) => (
				// <EditFederationContainersListItem
				// 	index={index}
				// 	key={container._id}
				// 	isSelected={container._id === selectedItemId}
				// 	container={container}
				// 	filterQuery={filterQuery}
				// />
				<div key={container._id}>{container.name}</div>
			))
		) : (
			<DashboardListEmptyContainer>
				{filterQuery && containers.length > 0 ? (
					<DashboardListEmptySearchResults searchPhrase={filterQuery} />
				) : (
					<DashboardListEmptyText>
						{emptyListMessage}
					</DashboardListEmptyText>
				)}
			</DashboardListEmptyContainer>
		)}
	</>
);
