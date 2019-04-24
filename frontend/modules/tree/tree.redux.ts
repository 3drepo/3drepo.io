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
	fetchFullTree: ['teamspace', 'modelId', 'revision'],
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
	setTreeNodesList: ['treeNodesList'],
	expandNode: ['id'],
	collapseNode: ['id'],
	selectNode: ['id'],
	deselectNode: ['id'],
	addToSelected: ['id'],
	addGroupToSelected: ['fromIndex', 'toIndex'],
	removeGroupFromSelected: ['fromIndex', 'toIndex'],
	removeFromSelected: ['id'],
	removeAllSelected: []
}, { prefix: 'TREE/' });

export interface ITreeComponentState {
	selectedFilters: any[];
	searchEnabled: boolean;
	ifcSpacesHidden: boolean;
	treeNodesList: any[];
	hiddenNodesMap: any;
	selectedNodesMap: any;
	expandedNodesMap: any;
	nodesIndexesMap: any;
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
		hiddenNodesMap: {},
		selectedNodesMap: {},
		expandedNodesMap: {},
		nodesIndexesMap: {}
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

export const expandNode = (state = INITIAL_STATE, { id }) => {
	const expandedNodesMap = { ...state.componentState.expandedNodesMap };
	expandedNodesMap[id] = true;

	return { ...state, componentState: { ...state.componentState, expandedNodesMap } };
};

export const collapseNode = (state = INITIAL_STATE, { id }) => {
	const expandedNodesMap = { ...state.componentState.expandedNodesMap };
	const treeNodesList = { ...state.componentState.treeNodesList };
	const nodesIndexesMap = { ...state.componentState.nodesIndexesMap };
	const nodeIndex = nodesIndexesMap[id];
	const node = treeNodesList[nodeIndex];

	if (node.childrenNumber) {
		for (let i = nodeIndex; i < nodeIndex + node.childrenNumber; i++) {
			if (expandedNodesMap[treeNodesList[i]._id]) {
				expandedNodesMap[treeNodesList[i]._id] = false;
			}
		}
	} else {
		expandedNodesMap[id] = false;
	}

	return { ...state, componentState: { ...state.componentState, expandedNodesMap } };
};

const resetComponentState = (state = INITIAL_STATE) => {
	return { ...state, componentState: INITIAL_STATE.componentState };
};

export const addToSelected = (state = INITIAL_STATE, { id }) => {
	const selectedNodesMap = { ...state.componentState.selectedNodesMap };
	selectedNodesMap[id] = true;
	return { ...state, componentState: { ...state.componentState, selectedNodesMap } };
};

export const addGroupToSelected = (state = INITIAL_STATE, { fromIndex, toIndex }) => {
	const selectedNodesMap = { ...state.componentState.selectedNodesMap };
	const treeNodesList = { ...state.componentState.treeNodesList };

	for (let i = fromIndex; i < toIndex; i++) {
		const nodeId = treeNodesList[i]._id;
		selectedNodesMap[nodeId] = true;
	}
	return { ...state, componentState: { ...state.componentState, selectedNodesMap } };
};

export const removeGroupFromSelected = (state = INITIAL_STATE, { fromIndex, toIndex }) => {
	const selectedNodesMap = { ...state.componentState.selectedNodesMap };
	const treeNodesList = { ...state.componentState.treeNodesList };

	for (let i = fromIndex; i < toIndex; i++) {
		const nodeId = treeNodesList[i]._id;
		selectedNodesMap[nodeId] = false;
	}
	return { ...state, componentState: { ...state.componentState, selectedNodesMap } };
};

// export const addToHighlighted = (state = INITIAL_STATE, { id }) => {
// 	const highlightedNodesMap = { ...state.componentState.highlightedNodesMap };
// 	highlightedNodesMap[id] = true;
// 	return { ...state, componentState: { ...state.componentState, highlightedNodesMap } };
// };

export const removeFromSelected = (state = INITIAL_STATE, { id }) => {
	const selectedNodesMap = { ...state.componentState.selectedNodesMap };
	selectedNodesMap[id] = false;
	return { ...state, componentState: { ...state.componentState, selectedNodesMap } };
};

// export const removeFromHighlighted = (state = INITIAL_STATE, { id }) => {
// 	const highlightedNodesMap = { ...state.componentState.highlightedNodesMap };
// 	highlightedNodesMap[id] = false;
// 	return { ...state, componentState: { ...state.componentState, highlightedNodesMap } };
// };

export const removeAllSelected = (state = INITIAL_STATE) => {
	return { ...state, componentState: { ...state.componentState, selectedNodesMap: {} } };
};

// export const removeAllHighlighted = (state = INITIAL_STATE) => {
// 	return { ...state, componentState: { ...state.componentState, highlightedNodesMap: {} } };
// };

export const reducer = createReducer(INITIAL_STATE, {
	[TreeTypes.CLEAR_SELECTED_NODES]: clearSelectedNodes,
	[TreeTypes.GET_SELECTED_NODES_SUCCESS]: getSelectedNodesSuccess,
	[TreeTypes.SET_COMPONENT_STATE]: setComponentState,
	[TreeTypes.RESET_COMPONENT_STATE]: resetComponentState,
	[TreeTypes.SET_IFC_SPACES_HIDDEN]: setIfcSpacesHidden,
	[TreeTypes.SET_TREE_NODES_LIST]: setTreeNodesList,
	[TreeTypes.EXPAND_NODE]: expandNode,
	[TreeTypes.COLLAPSE_NODE]: collapseNode,
	[TreeTypes.ADD_TO_SELECTED]: addToSelected,
	// [TreeTypes.ADD_TO_HIGHLIGHTED]: addToHighlighted,
	[TreeTypes.REMOVE_FROM_SELECTED]: removeFromSelected,
	// [TreeTypes.REMOVE_FROM_HIGHLIGHTED]: removeFromHighlighted,
	[TreeTypes.REMOVE_ALL_SELECTED]: removeAllSelected,
	// [TreeTypes.REMOVE_ALL_HIGHLIGHTED]: removeAllHighlighted,
	[TreeTypes.ADD_GROUP_TO_SELECTED]: addGroupToSelected,
	[TreeTypes.REMOVE_GROUP_FROM_SELECTED]: removeGroupFromSelected
});
