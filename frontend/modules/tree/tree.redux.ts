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

export const { Types: TreeTypes, Creators: TreeActions } = createActions({
	startListenOnSelections: [],
	stopListenOnSelections: [],
	addSelectedNode: ['objectId'],
	removeSelectedNode: ['objectId'],
	clearSelectedNodes: [],
	setSelectedNodes: ['selectedNodes']
}, { prefix: 'TREE/' });

export interface IObjectObjectState {
	selectedNodes: any;
}

export const INITIAL_STATE: IObjectObjectState = {
	selectedNodes: {}
};

export const addSelectedNode = (state = INITIAL_STATE, { objectId }) => {
	const selectedNodes = {...state.selectedNodes};
	selectedNodes[objectId] = true;
	return { ...state, selectedNodes };
};

export const removeSelectedNode = (state = INITIAL_STATE, { objectId }) => {
	const selectedNodes = {...state.selectedNodes};
	delete selectedNodes[objectId];
	return { ...state, selectedNodes };
};

export const clearSelectedNodes = (state = INITIAL_STATE, {}) => {
	return { ...state, selectedNodes: {} };
};

export const setSelectedNodes = (state = INITIAL_STATE, { selectedNodes }) => {
	return { ...state, selectedNodes };
};

export const reducer = createReducer(INITIAL_STATE, {
	[TreeTypes.ADD_SELECTED_NODE]: addSelectedNode,
	[TreeTypes.REMOVE_SELECTED_NODE]: removeSelectedNode,
	[TreeTypes.CLEAR_SELECTED_NODES]: clearSelectedNodes,
	[TreeTypes.SET_SELECTED_NODES]: setSelectedNodes
});
