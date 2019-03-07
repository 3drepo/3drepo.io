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
	clearSelectedNodes: [],
	getSelectedNodes: [],
	getSelectedNodesSuccess: ['selectedNodes']
}, { prefix: 'TREE/' });

export interface IObjectObjectState {
	selectedNodes: any;
}

export const INITIAL_STATE: IObjectObjectState = {
	selectedNodes: []
};

export const clearSelectedNodes = (state = INITIAL_STATE, {}) => {
	return { ...state, selectedNodes: [] };
};

export const getSelectedNodesSuccess = (state = INITIAL_STATE, { selectedNodes }) => {
	return { ...state, selectedNodes };
};

export const reducer = createReducer(INITIAL_STATE, {
	[TreeTypes.CLEAR_SELECTED_NODES]: clearSelectedNodes,
	[TreeTypes.GET_SELECTED_NODES_SUCCESS]: getSelectedNodesSuccess
});
