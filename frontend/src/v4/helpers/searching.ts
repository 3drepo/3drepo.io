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

import { get, groupBy, isArray, map } from 'lodash';
import { FILTER_TYPES } from '../routes/components/filterPanel/filterPanel';

export const compareStrings = (string1, string2) => {
	return (string1 || '').toLowerCase().includes((string2 || '').toLowerCase());
};

interface Filter {
	label: string;
	type: FILTER_TYPES;
	relatedField: string;
	value: { "label": string, "value": string | number, "date"?: number }
}

const getFilter = (filters: Filter[], queryFields) => {
	const filterType = get(filters[0], 'type', FILTER_TYPES.UNDEFINED);
	return (item) => {

		if (filterType === FILTER_TYPES.UNDEFINED) {
			return filters.some((filter) => {
				const filterValue =
					isArray(item[filter.relatedField]) && !item[filter.relatedField].length ? [''] : item[filter.relatedField];
				const itemValue = isArray(filterValue) ? filterValue || [''] : [filterValue];

				return itemValue.every((value) => {
					if (typeof value === 'string') {
						return !filter.value.value ? filter.value.value === value : compareStrings(value, filter.value.value);
					}
					if (typeof value === 'number') {
						return value === filter.value.value;
					}
					return false;
				});
			});
		}

		if (filterType === FILTER_TYPES.QUERY) {
				return filters.some((filter) => {
					const logFound = item.comments && item.comments.length ? item.comments.some(({ comment }) => {
						if (comment) {
							return compareStrings(comment, filter.value.value);
						}
						return false;
					}) : false;

					return logFound || queryFields.some((field) => {
						return compareStrings(`${item[field]}`, filter.value.value);
					});
				})
		}

		if (filterType === FILTER_TYPES.DATE) {
			return filters.every((filter) => {
				const itemValue = item[filter.relatedField];
				if (!itemValue) {
					return false;
				}

				const boundryType = filter.value.value as string;
				const boundryValue = filter.value.date;

				if (boundryType.includes('from')) {
					return itemValue >= boundryValue;
				}

				return itemValue <= boundryValue;
			});
		}
	}
}

const getFiltersByRelatedField = (filters: Filter[], queryFields: string[]) => {
	// In general the filtering criteria is (field1 === 'aValue' OR field1 === 'anotherValue') AND (field2 === 'filterValueForfield2' OR field2 === 'anotherfilterValueForfield2')
	// when comparing fields of date type is like  fieldDate  >= startDate AND fieldDate  <= endDate so it doesnt follow the general rule
	const groupedFilters = groupBy(filters, 'relatedField');
	return Object.keys(groupedFilters).map((key) => getFilter(groupedFilters[key], queryFields));
}

export const searchByFilters = (
	items = [],
	filters: Filter[] = [],
	returnDefaultHidden = false,
	queryFields = ['name', 'desc', 'number']
) => {
	return items.filter((value) =>
		(returnDefaultHidden || !value.defaultHidden) &&
		getFiltersByRelatedField(filters, queryFields).every(filter => filter(value))
	);
};
