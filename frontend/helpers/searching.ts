import { DATA_TYPES } from '../routes/components/filterPanel/filterPanel.component';

const compareStrings = (string1 = '', string2 = '') => {
	return string1.toLowerCase().includes(string2.toLowerCase());
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
				return compareStrings(risk[filter.relatedField], filter.value.value);
			}

			if (filter.type === DATA_TYPES.QUERY) {
				return compareStrings(risk.name, filter.value.value) || compareStrings(risk.disc, filter.value.value);
			}

			return false;
		});
	});
};
