export const filterNestedData = (data: any[], condition: (i: any) => any[], childrenPath: string = 'subActivities') => {
	const lists = [];
	data.forEach((item) => {
		let result;
		if (condition(item)) {
			result = { ...item };
		} else if (item[childrenPath]) {
			const children = filterNestedData(item[childrenPath], condition);

			if (children.length > 0) {
				result = { ...item, [childrenPath]: children };
			}
		}

		if (result) {
			lists.push(result);
		}
	});

	return lists;

};
