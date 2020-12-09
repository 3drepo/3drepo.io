import { get, groupBy, isArray, map } from 'lodash';
import { FILTER_TYPES } from '../routes/components/filterPanel/filterPanel.component';

export const compareStrings = (string1, string2) => {
	return (string1 || '').toLowerCase().includes((string2 || '').toLowerCase());
};

const dateFloor = (date) => new Date(date).setHours(0, 0, 0, 0);
const dateCeiling = (date) => new Date(date).setHours(23, 59, 59, 999);

export const searchByFilters = (
		items = [],
		filters = [],
		returnDefaultHidden = false,
		queryFields = ['name', 'desc']
	) => {
	const prefilteredItems = !returnDefaultHidden ? items.filter(({defaultHidden}) => !defaultHidden) : items;

	if (!filters.length) {
		return prefilteredItems;
	}

	const groupedFilters = groupBy(filters, 'relatedField');
	return prefilteredItems.filter((item) => {
		const filteringResults: any = map(groupedFilters, (selectedFilters: any) => {
			const filterType = get(selectedFilters[0], 'type', FILTER_TYPES.UNDEFINED);

			switch (filterType) {
				case FILTER_TYPES.UNDEFINED:
					return selectedFilters.some((filter) => {
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
					break;
				case FILTER_TYPES.QUERY:
					return selectedFilters.some((filter) => {
						const logFound = item.comments && item.comments.length ? item.comments.some(({ comment }) => {
							if (comment) {
								return compareStrings(comment, filter.value.value);
							}
							return false;
						}) : false;

						return logFound || queryFields.some((field) => {
							return compareStrings(`${item[field]}`, filter.value.value);
						});
					});
					break;
				case FILTER_TYPES.DATE:
					return selectedFilters.every((filter) => {
						const itemValue = item[filter.relatedField];
						if (!itemValue) {
							return false;
						}

						const boundryType = filter.value.value;
						const boundryValue = filter.value.date;

						if (boundryType.includes('from')) {
							return itemValue >= dateFloor(boundryValue);
						}

						return itemValue <= dateCeiling(boundryValue);
					});
					break;
			}
		});

		return filteringResults.every((result) => result);
	});
};
