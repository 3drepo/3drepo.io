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
	removeAllSelected: [],
	setIsPending: ['isPending'],
	setTreeNodesVisibility: ['nodes', 'visibility'],
	updateParentVisibility: ['parentNode'],
	handleNodesClick: ['nodesIds', 'skipExpand'],
	handleNodesClickBySharedIds: ['nodesIds'],
	handleBackgroundClick: [],
	setAuxiliaryMaps: ['auxiliaryMaps'],
	setNodesSelectionMap: ['nodesSelectionMap']
}, { prefix: 'TREE/' });

export interface ITreeComponentState {
	selectedFilters: any[];
	searchEnabled: boolean;
	ifcSpacesHidden: boolean;
	expandedNodesMap: any;
	numberOfInvisibleChildrenMap: any;
}

export interface ITreeState {
	selectedNodes: any;
	treeNodesList: any[];
	componentState: ITreeComponentState;
	isPending?: boolean;
	nodesVisibilityMap: any;
	nodesSelectionMap: any;
	nodesIndexesMap: any;
	nodesBySharedIdsMap: any;
}

export const INITIAL_STATE: ITreeState = {
	selectedNodes: [],
	treeNodesList: [],
	isPending: true,
	nodesVisibilityMap: {},
	nodesSelectionMap: {},
	nodesIndexesMap: {},
	nodesBySharedIdsMap: {},
	componentState: {
		selectedFilters: [],
		searchEnabled: false,
		ifcSpacesHidden: true,
		expandedNodesMap: {},
		numberOfInvisibleChildrenMap: {}
	}
};

const clearSelectedNodes = (state = INITIAL_STATE, {}) => {
	return { ...state, selectedNodes: [] };
};

const getSelectedNodesSuccess = (state = INITIAL_STATE, { selectedNodes }) => {
	return { ...state, selectedNodes };
};

const setTreeNodesList = (state = INITIAL_STATE, { treeNodesList }) => {
	return { ...state, treeNodesList };
};

const setIsPending = (state = INITIAL_STATE, { isPending }) => ({ ...state, isPending });

const setComponentState = (state = INITIAL_STATE, { componentState = {} }) => {
	return { ...state, componentState: { ...state.componentState, ...componentState } };
};

const setIfcSpacesHidden = (state = INITIAL_STATE, { ifcSpacesHidden }) => {
	return { ...state, componentState: { ...state.componentState, ifcSpacesHidden } };
};

const setNodesSelectionMap = (state = INITIAL_STATE, { nodesSelectionMap }) => {
	return { ...state, nodesSelectionMap };
};

const setAuxiliaryMaps = (state = INITIAL_STATE, { auxiliaryMaps }) => {
	return { ...state, ...auxiliaryMaps };
};

const expandNode = (state = INITIAL_STATE, { id }) => {
	const expandedNodesMap = { ...state.componentState.expandedNodesMap };
	expandedNodesMap[id] = true;

	return { ...state, componentState: { ...state.componentState, expandedNodesMap } };
};

const collapseNode = (state = INITIAL_STATE, { id }) => {
	const expandedNodesMap = { ...state.componentState.expandedNodesMap };
	const nodeIndex = state.nodesIndexesMap[id];
	const node = state.treeNodesList[nodeIndex];

	if (node.childrenNumber) {
		for (let i = nodeIndex; i < nodeIndex + node.childrenNumber; i++) {
			if (expandedNodesMap[state.treeNodesList[i]._id]) {
				expandedNodesMap[state.treeNodesList[i]._id] = false;
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

const addToSelected = (state = INITIAL_STATE, { id }) => {
	const selectedNodesMap = { ...state.componentState.selectedNodesMap };
	selectedNodesMap[id] = true;
	return { ...state, componentState: { ...state.componentState, selectedNodesMap } };
};

const addGroupToSelected = (state = INITIAL_STATE, { fromIndex, toIndex }) => {
	const selectedNodesMap = { ...state.componentState.selectedNodesMap };

	for (let i = fromIndex; i < toIndex; i++) {
		const nodeId = state.treeNodesList[i]._id;
		selectedNodesMap[nodeId] = true;
	}
	return { ...state, componentState: { ...state.componentState, selectedNodesMap } };
};

const removeGroupFromSelected = (state = INITIAL_STATE, { fromIndex, toIndex }) => {
	const selectedNodesMap = { ...state.componentState.selectedNodesMap };

	for (let i = fromIndex; i < toIndex; i++) {
		const nodeId = state.treeNodesList[i]._id;
		selectedNodesMap[nodeId] = false;
	}
	return { ...state, componentState: { ...state.componentState, selectedNodesMap } };
};

// const addToHighlighted = (state = INITIAL_STATE, { id }) => {
// 	const highlightedNodesMap = { ...state.componentState.highlightedNodesMap };
// 	highlightedNodesMap[id] = true;
// 	return { ...state, componentState: { ...state.componentState, highlightedNodesMap } };
// };

const removeFromSelected = (state = INITIAL_STATE, { id }) => {
	const selectedNodesMap = { ...state.componentState.selectedNodesMap };
	selectedNodesMap[id] = false;
	return { ...state, componentState: { ...state.componentState, selectedNodesMap } };
};

// const removeFromHighlighted = (state = INITIAL_STATE, { id }) => {
// 	const highlightedNodesMap = { ...state.componentState.highlightedNodesMap };
// 	highlightedNodesMap[id] = false;
// 	return { ...state, componentState: { ...state.componentState, highlightedNodesMap } };
// };

const removeAllSelected = (state = INITIAL_STATE) => {
	return { ...state, componentState: { ...state.componentState, selectedNodesMap: {} } };
};

// const removeAllHighlighted = (state = INITIAL_STATE) => {
// 	return { ...state, componentState: { ...state.componentState, highlightedNodesMap: {} } };
// };

export const reducer = createReducer(INITIAL_STATE, {
	[TreeTypes.CLEAR_SELECTED_NODES]: clearSelectedNodes,
	[TreeTypes.GET_SELECTED_NODES_SUCCESS]: getSelectedNodesSuccess,
	[TreeTypes.SET_COMPONENT_STATE]: setComponentState,
	[TreeTypes.SET_IS_PENDING]: setIsPending,
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
	[TreeTypes.REMOVE_GROUP_FROM_SELECTED]: removeGroupFromSelected,
	[TreeTypes.SET_NODES_SELECTION_MAP]: setNodesSelectionMap,
	[TreeTypes.SET_AUXILIARY_MAPS]: setAuxiliaryMaps
});
