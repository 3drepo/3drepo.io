import { isArray } from 'lodash';
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

export const searchByFilters = (items = [], filters = []) => {
	if (!filters.length) {
		return items;
	}

	return items.filter((risk) => {
		return filters.some((filter) => {
			if (filter.type === DATA_TYPES.UNDEFINED) {
				const values = isArray(risk[filter.relatedField]) ? risk[filter.relatedField] : [risk[filter.relatedField]];
				return values.every((value) => {
					if (typeof value === 'string') {
						return compareStrings(value, filter.value.value);
					} else if (typeof value === 'number') {
						return value === filter.value.value;
					}
				});
			}

			if (filter.type === DATA_TYPES.QUERY) {
				return compareStrings(risk.name, filter.value.value) || compareStrings(risk.disc, filter.value.value);
			}

			return false;
		});
	});
};
