import { isArray, groupBy, map, get } from 'lodash';
import { DATA_TYPES } from '../routes/components/filterPanel/filterPanel.component';

export const compareStrings = (string1, string2) => {
	return (string1 || '').toLowerCase().includes((string2 || '').toLowerCase());
};

// DEPRECATED
export const stringSearch = (superString: string, subString: string) => {
	if (!superString) {
		return false;
	}

	return (superString.toLowerCase().indexOf(subString.toLowerCase()) !== -1);
};

export const searchByFilters = (items = [], filters = [], returnDefaultHidden = false) => {
	const prefilteredItems = !returnDefaultHidden ? items.filter(({defaultHidden}) => !defaultHidden) : items;
	const groupedFilters = groupBy(filters, 'relatedField');

	if (!filters.length) {
		return prefilteredItems;
	}
	return prefilteredItems.filter((item) => {
		const filteringResults: any = map(groupedFilters, (selectedFilters: any) => {
			const filterType = get(selectedFilters[0], 'type', DATA_TYPES.UNDEFINED);

			if (filterType === DATA_TYPES.UNDEFINED) {
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
			}

			if (filterType === DATA_TYPES.QUERY) {
				return selectedFilters.some((filter) => {
					const logFound = item.commentCount ? item.comments.some((log) => {
						if (log.comment) {
							return compareStrings(log.comment, filter.value.value);
						}
						return false;
					}) : false;

					return compareStrings(item.name, filter.value.value) || compareStrings(item.desc, filter.value.value) || logFound;
				});
			}

			if (filterType === DATA_TYPES.DATE) {
				return selectedFilters.every((filter) => {
					const itemValue = item[filter.relatedField];
					if (!itemValue) {
						return false;
					}

					const boundryType = filter.value.value;
					const boundryValue = filter.value.date;

					if (boundryType === 'from') {
						return itemValue >= boundryValue;
					}

					return itemValue <= boundryValue;
				});
			}
		});

		return filteringResults.every((result) => result);
	});
};
