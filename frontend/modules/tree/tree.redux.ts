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
	fetchTreeData: [],
	startListenOnSelections: [],
	stopListenOnSelections: [],
	clearSelectedNodes: [],
	getSelectedNodes: [],
	getSelectedNodesSuccess: ['selectedNodes'],
	showAllNodes: [],
	hideSelectedNodes: [],
	isolateSelectedNodes: [],
	hideIfcSpaces: [],
	setComponentState: ['componentState'],
	resetComponentState: [],
	setIfcSpacesHidden: ['ifcSpacesHidden'],
	setTreeNodesList: ['treeNodesList']
}, { prefix: 'TREE/' });

export interface ITreeComponentState {
	selectedFilters: any[];
	searchEnabled: boolean;
	ifcSpacesHidden: boolean;
	treeNodesList: any[];
	visibleNodesMap: any;
	highlightedNodesMap: any;
	selectedNodesMap: any;
}
export interface ITreeState {
	selectedNodes: any;
	componentState: ITreeComponentState;
}

export const INITIAL_STATE: ITreeState = {
	selectedNodes: [],
	componentState: {
		selectedFilters: [],
		searchEnabled: false,
		ifcSpacesHidden: true,
		treeNodesList: [],
		visibleNodesMap: {},
		highlightedNodesMap: {},
		selectedNodesMap: {}
	}
};

export const clearSelectedNodes = (state = INITIAL_STATE, {}) => {
	return { ...state, selectedNodes: [] };
};

export const getSelectedNodesSuccess = (state = INITIAL_STATE, { selectedNodes }) => {
	return { ...state, selectedNodes };
};

export const setTreeNodesList = (state = INITIAL_STATE, { treeNodesList }) => {
	return { ...state, componentState: { ...state.componentState, treeNodesList } };
};

export const setComponentState = (state = INITIAL_STATE, { componentState = {} }) => {
	return { ...state, componentState: { ...state.componentState, ...componentState } };
};

export const setIfcSpacesHidden = (state = INITIAL_STATE, { ifcSpacesHidden }) => {
	return { ...state, componentState: { ...state.componentState, ifcSpacesHidden } };
};

const resetComponentState = (state = INITIAL_STATE) => {
	return { ...state, componentState: INITIAL_STATE.componentState };
};

export const reducer = createReducer(INITIAL_STATE, {
	[TreeTypes.CLEAR_SELECTED_NODES]: clearSelectedNodes,
	[TreeTypes.GET_SELECTED_NODES_SUCCESS]: getSelectedNodesSuccess,
	[TreeTypes.SET_COMPONENT_STATE]: setComponentState,
	[TreeTypes.RESET_COMPONENT_STATE]: resetComponentState,
	[TreeTypes.SET_IFC_SPACES_HIDDEN]: setIfcSpacesHidden,
	[TreeTypes.SET_TREE_NODES_LIST]: setTreeNodesList
});
