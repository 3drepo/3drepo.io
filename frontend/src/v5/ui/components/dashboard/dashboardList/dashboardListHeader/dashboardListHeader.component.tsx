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

import React, { Dispatch, useState } from 'react';
import { ISortConfig } from '@/v5/ui/routes/dashboard/projects/containers/containersList/containersList.hooks';
import { SortingDirection } from '../dashboardList.types';
import { DashboardListHeaderContainer } from './dashboardListHeader.styles';

type IDashboardListHeader = {
	onSortingChange: Dispatch<ISortConfig>;
	children: JSX.Element[];
	defaultSortConfig: ISortConfig;
};

export const DashboardListHeader = ({
	onSortingChange,
	children,
	defaultSortConfig,
}: IDashboardListHeader): JSX.Element => {
	const [sort, setSort] = useState(defaultSortConfig);

	const registerSort = (colName) => {
		if (!colName) {
			return {};
		}

		const onClick = () => {
			let { direction: directionState } = sort;
			if (colName === sort.column) {
				directionState = directionState === SortingDirection.ASCENDING
					? SortingDirection.DESCENDING : SortingDirection.ASCENDING;
			} else {
				directionState = SortingDirection.DESCENDING;
			}
			setSort({ column: colName, direction: directionState });
			onSortingChange({ column: colName, direction: directionState });
		};

		const sortingDirection = (colName === sort.column ? sort.direction : undefined);

		return { sortingDirection, onClick, sort: true };
	};

	return (
		<DashboardListHeaderContainer>
			{children.map((child) => (
				React.cloneElement(child, {
					key: child.props.name,
					...registerSort(child.props.name),
					...child.props,
				})
			))}
		</DashboardListHeaderContainer>
	);
};
