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

import { useMemo, useState } from 'react';
import { SortingDirection } from '@components/dashboard/dashboardList/dashboardList.types';
import { ISortConfig } from './useOrderedList.types';

export const useOrderedList = <T>(items: T[], defaultConfig: ISortConfig) => {
	const [sortConfig, setSortConfig] = useState<ISortConfig>(defaultConfig);

	const sortedList = useMemo(() => {
		const { column, direction } = sortConfig;

		const sortingFunction = (a: T, b: T): number => {
			if (typeof a[column] === 'string') {
				return a[column].localeCompare(b[column]);
			}

			if (typeof a[column] === 'number') {
				return a[column] - b[column];
			}

			if (a[column] instanceof Date) {
				return a[column].getTime() - b[column].getTime();
			}

			if (a[column] instanceof File) {
				return a[column].name.localeCompare(b[column].name);
			}

			return 0;
		};

		const sortingFunctionWithDirection = direction === SortingDirection.ASCENDING
			? sortingFunction : (a: T, b: T) => sortingFunction(b, a);

		return [...items].sort(sortingFunctionWithDirection);
	}, [sortConfig, items]);

	return { sortedList, setSortConfig };
};
