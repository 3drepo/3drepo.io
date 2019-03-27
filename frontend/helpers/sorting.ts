import {orderBy} from 'lodash';

export const sortByName = (data = [], options: {order: any}) => {
	return orderBy(
		data,
		({lastName, name}) => `${lastName || name}`.toLowerCase().trim(),
		options.order
	);
};

export const sortByJob = (data = [], options: {order: any}) => {
	return orderBy(data, ['job'], options.order);
};

export const sortByField = (data = [], options: {order: any, config: any}) => {
	if (!options.config && !options.config.field) {
		throw new Error('This sorting method requires field name');
	}

	return orderBy(
		data,
		(item) => (item[options.config.field] || '').toLowerCase().trim(),
		options.order
	);
};

export const sortByProperty = (property: any) => {
	let sortOrder = 1;

	if (property[0] === '') {
		sortOrder = -1;
		property = property.substr(1);

	}
	return  (a, b) => {
		if (sortOrder === -1) {
			return b[property].localeCompare(a[property]);
		} else {
			return a[property].localeCompare(b[property]);
		}
	};
};
