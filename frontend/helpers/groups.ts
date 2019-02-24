import { omit } from 'lodash';

export const prepareGroup = (group) => {
	return {
		...group
	};
};

export const mergeGroupData = (source, data = source) => {
	return {
		...source,
		...omit(data, ['description']),
		desc: data.description
	};
};
