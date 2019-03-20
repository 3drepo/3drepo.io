import { isArray, groupBy, values, get } from 'lodash';
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
		return values(groupedFilters).every((selectedFilters: any) => {
				return selectedFilters.some((filter) => {
					if (filter.type === DATA_TYPES.UNDEFINED) {
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
					}
					if (filter.type === DATA_TYPES.QUERY) {
						return compareStrings(item.name, filter.value.value) || compareStrings(item.desc, filter.value.value);
					}
				});
			}
		);
	});
};
