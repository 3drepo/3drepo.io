/**
 *  Copyright (C) 2023 3D Repo Ltd
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

// Positive infinity ensures null values are shown at the top
export const dateToNum = (date) => (date ? (date).getTime() : Number.POSITIVE_INFINITY);

import { CALIBRATION_SORT_ORDER } from '@/v5/ui/routes/dashboard/projects/calibration/calibration.helpers';
import { SortingDirection } from '@components/dashboard/dashboardList/dashboardList.types';
import { get, isArray } from 'lodash';

export const getSortingFunction = <T>(sortConfig) => {
	const { column, direction } = sortConfig;

	const sortingFunction = (a: T, b: T, index = 0): number => {
		const aValue = get(a, column[index]);
		const bValue = get(b, column[index]);

		if (!aValue && !bValue) {
			return 0;
		}

		if (!aValue) {
			return -1;
		}

		if (!bValue) {
			return +1;
		}

		if (aValue === bValue && (index + 1 < column.length)) {
			return direction[index] === SortingDirection.ASCENDING
				? sortingFunction(a, b, index + 1) : sortingFunction(b, a, index + 1);
		}

		if (typeof aValue === 'boolean') {
			return +aValue - +bValue;
		}

		if (aValue in CALIBRATION_SORT_ORDER && bValue in CALIBRATION_SORT_ORDER) {
			return CALIBRATION_SORT_ORDER[aValue] - CALIBRATION_SORT_ORDER[bValue];
		}

		if (typeof aValue === 'string') {
			return aValue.localeCompare(bValue);
		}

		if (typeof aValue === 'number') {
			return aValue - bValue;
		}

		if (isArray(aValue)) {
			return aValue.length - bValue.length;
		}

		if (aValue instanceof Date || bValue instanceof Date) {
			return dateToNum(aValue) - dateToNum(bValue);
		}

		return 0;
	};

	return  direction[0] === SortingDirection.ASCENDING ? sortingFunction : (a: T, b: T) => sortingFunction(b, a);
};
