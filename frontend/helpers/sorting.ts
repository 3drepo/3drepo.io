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

export const sortByDate = (data = [], options: {order: any}, fieldName = 'created') => {
	return orderBy(
		data,
		(item) => new Date(item[fieldName]),
		options.order
	);
};
