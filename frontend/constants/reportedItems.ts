export const getFilterValues = (property) => {
	return property.map(({value, name}) => {
		return {
			label: name,
			value
		};
	});
};

export const UNASSIGNED_JOB = {
	name: 'Unassigned',
	value: ''
};
