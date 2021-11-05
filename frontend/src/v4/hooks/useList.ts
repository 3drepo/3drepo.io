/**
 *  Copyright (C) 2021 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
