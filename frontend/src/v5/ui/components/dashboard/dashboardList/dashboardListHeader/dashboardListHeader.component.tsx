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

import { Dispatch, useState, cloneElement } from 'react';
import { slice } from 'lodash';
import { SortingDirection } from '../dashboardList.types';
import { ISortConfig } from '../useOrderedList';
import { DashboardListHeaderContainer } from './dashboardListHeader.styles';

type IDashboardListHeader = {
	className?: string;
	onSortingChange: Dispatch<ISortConfig>;
	children: JSX.Element[];
	defaultSortConfig?: ISortConfig;
};

export const DashboardListHeader = ({
	className,
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
			const { direction: directionState } = sort;
			let newDirection: SortingDirection = SortingDirection.DESCENDING;
			if (colName === sort.column[0]) {
				newDirection = directionState[0] === SortingDirection.ASCENDING
					? SortingDirection.DESCENDING : SortingDirection.ASCENDING;
			}
			setSort((prev) => ({ column: [colName, ...slice(prev.column, 1)], direction: [newDirection, ...slice(prev.direction, 1)] }));
			// @ts-ignore
			onSortingChange((prev) => ({ column: [colName, ...slice(prev.column, 1)], direction: [newDirection, ...slice(prev.direction, 1)] }));
		};

		const sortingDirection = (colName === sort?.column[0] ? sort.direction[0] : undefined);
		return { sortingDirection, onClick, sort: true };
	};

	return (
		<DashboardListHeaderContainer className={className}>
			{children.map((child, index) => (
				cloneElement(child, {
					key: child.props.name || index,
					...registerSort(child.props.name),
					...child.props,
				})
			))}
		</DashboardListHeaderContainer>
	);
};
