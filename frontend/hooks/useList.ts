import { useReducer } from 'react';

const ACTION_TYPES = {
	ADD: 'ADD',
	REMOVE: 'REMOVE',
	REMOVE_BY_INDEX: 'REMOVE_BY_INDEX'
};

const reducer = (list = [], { type, payload }) => {
	switch (type) {
		case ACTION_TYPES.ADD:
			return [...list, payload.item];
		case ACTION_TYPES.REMOVE:
			return list.filter((item) => item !== payload.item);
		case ACTION_TYPES.REMOVE_BY_INDEX:
			return list.filter((item, index) => index !== payload.index);
		default:
			throw new Error();
	}
};

export const useList = (initialList = []) => {
	const [list, dispatch] = useReducer(reducer, initialList);

	const add = (item) => dispatch({ type: ACTION_TYPES.ADD, payload: item });
	const remove = (item) => dispatch({ type: ACTION_TYPES.REMOVE, payload: item });
	const removeByIndex = (index) => dispatch({ type: ACTION_TYPES.REMOVE_BY_INDEX, payload: index });

	return Object.freeze({
		get: () => list,
		add,
		remove,
		removeByIndex
	});
};
