import {orderBy} from "lodash";

export const sortByName = (data = [], options: {order: any}) => {
	return orderBy(
		data,
		({lastName, name}) => `${lastName || name}`.toLowerCase().trim(),
		options.order
	);
};

export const sortByJob = (data = [], options: {order: any}) => {
	return orderBy(data, ["job"], options.order);
};
