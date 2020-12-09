export const filterNestedData = (data: any[], condition: (i: any) => any[], childrenPath: string = 'subTasks') =>
	data.reduce((list, item) => {
		let result = null;

		if (condition(item)) {
			result = { ...item };
		} else if (item[childrenPath]) {
			const children = filterNestedData(item[childrenPath], condition);

			if (children.length > 0) {
				result = { ...item, [childrenPath]: children };
			}
		}

		if (result) {
			list.push(result);
		}

		return list;
	}, []);
