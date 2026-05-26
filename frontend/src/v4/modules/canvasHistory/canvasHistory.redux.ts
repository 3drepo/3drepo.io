/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import { createActions, createReducer } from 'reduxsauce';
import undoable from 'redux-undo';
import { ELEMENT_TYPES } from '../../routes/components/screenshotDialog/markupStage/markupStage.helpers';
import { batchGroupBy } from './canvasHistory.helpers';

export const { Types: CanvasHistoryTypes, Creators: CanvasHistoryActions } = createActions({
	setActiveSuccess: ['isActive'],
	setDisabledSuccess: ['isDisabled'],
	add: ['element'],
	remove: ['elementName'],
	update: ['elementName', 'properties'],
	undo: [],
	redo: [],
	clearHistory: [],
	initHistory: []
}, { prefix: 'CANVAS_HISTORY/' });

export const INITIAL_STATE = {
	elements: []
};

export const setActiveSuccess = (state = INITIAL_STATE, { isActive }) => ({ ...state, isActive });

export const add = (state = INITIAL_STATE, { element }) => {
	const elements = [...state.elements, element];
	return { ...state, elements };
};

export const update = (state = INITIAL_STATE, { elementName, properties }) => {
	const selectedIndex = state.elements.findIndex((el) => el.name === elementName);
	const elements = [...state.elements];

	if (selectedIndex >= 0) {
		elements[selectedIndex] = {
			...elements[selectedIndex],
			...properties
		};
	}
	return { ...state, elements };
};

export const remove = (state = INITIAL_STATE, { elementName }) => {
	const elements = [...state.elements].filter((el) => el.name !== elementName);
	return { ...state, elements };
};

export const setDisabledSuccess = (state = INITIAL_STATE, { isDisabled }) => ({ ...state, isDisabled });

export const undo = (state = INITIAL_STATE, {}) => {
	return { ...state };
};

export const redo = (state = INITIAL_STATE, {}) => {
	return { ...state };
};

export const clear = (state = INITIAL_STATE, {}) => {
	return { ...state };
};

export const init = (state = INITIAL_STATE, {}) => {
	return { ...state, elements: [] };
};

export const reducer = undoable(
	createReducer(INITIAL_STATE, {
		[CanvasHistoryTypes.SET_ACTIVE_SUCCESS]: setActiveSuccess,
		[CanvasHistoryTypes.SET_DISABLED_SUCCESS]: setDisabledSuccess,
		[CanvasHistoryTypes.UNDO]: undo,
		[CanvasHistoryTypes.REDO]: redo,
		[CanvasHistoryTypes.CLEAR_HISTORY]: clear,
		[CanvasHistoryTypes.INIT_HISTORY]: init,
		[CanvasHistoryTypes.ADD]: add,
		[CanvasHistoryTypes.UPDATE]: update,
		[CanvasHistoryTypes.REMOVE]: remove
	}), {
		undoType: CanvasHistoryTypes.UNDO,
		redoType: CanvasHistoryTypes.REDO,
		groupBy: batchGroupBy.init([]),
		clearHistoryType: CanvasHistoryTypes.CLEAR_HISTORY,
		ignoreInitialState: true
	},
);
