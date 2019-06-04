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
import { uniqueId } from 'lodash';

export const { Types: TreeTypes, Creators: TreeActions } = createActions({
	fetchFullTree: ['teamspace', 'modelId', 'revision'],
	startListenOnSelections: [],
	stopListenOnSelections: [],
	clearSelectedNodes: [],
	getSelectedNodes: [],
	getSelectedNodesSuccess: ['selectedNodes'],
	showAllNodes: ['shouldUpdateModel'],
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
	setIsPending: ['isPending'],
	setTreeNodesVisibility: ['nodesIds', 'visibility', 'skipChildren', 'skipParents'],
	setTreeNodesVisibilitySuccess: [],
	handleNodesClick: ['nodesIds', 'skipExpand'],
	handleNodesClickBySharedIds: ['objects'],
	handleBackgroundClick: [],
	setAuxiliaryMaps: ['auxiliaryMaps'],
	setNodesSelectionMap: ['nodesSelectionMap'],
	showNodesBySharedIds: ['objects'],
	selectNodes: ['nodesIds', 'skipExpand', 'skipChildren', 'colour'],
	selectNodesSuccess: [],
	selectNodesBySharedIds: ['objects', 'colour'],
	deselectNodesBySharedIds: ['objects'],
	deselectNodes: ['nodesIds'],
	isolateNodesBySharedIds: ['objects'],
	hideNodesBySharedIds: ['objects'],
	isolateNode: ['id'],
	clearCurrentlySelected: [],
	setExpanedNodesMap: ['expandedNodesMap'],
	updateDataRevision: []
}, { prefix: 'TREE/' });

export interface ITreeComponentState {
	selectedFilters: any[];
	searchEnabled: boolean;
	ifcSpacesHidden: boolean;
}

export interface ITreeState {
	selectedNodes: any;
	treeNodesList: any[];
	expandedNodesMap: any;
	componentState: ITreeComponentState;
	isPending?: boolean;
	dataRevision: string;
}

export const INITIAL_STATE: ITreeState = {
	selectedNodes: [],
	treeNodesList: [],
	isPending: true,
	expandedNodesMap: {},
	dataRevision: 'empty',
	componentState: {
		selectedFilters: [],
		searchEnabled: false,
		ifcSpacesHidden: true
	}
};

const clearSelectedNodes = (state = INITIAL_STATE, {}) => {
	return { ...state, selectedNodes: [] };
};

const getSelectedNodesSuccess = (state = INITIAL_STATE, { selectedNodes }) => {
	return { ...state, selectedNodes };
};

const setTreeNodesList = (state = INITIAL_STATE, { treeNodesList }) => {
	return { ...state, treeNodesList, dataRevision: uniqueId('tree-data-rev-') };
};

const setIsPending = (state = INITIAL_STATE, { isPending }) => ({ ...state, isPending });

const setComponentState = (state = INITIAL_STATE, { componentState = {} }) => {
	return { ...state, componentState: { ...state.componentState, ...componentState } };
};

const setIfcSpacesHidden = (state = INITIAL_STATE, { ifcSpacesHidden }) => {
	return { ...state, componentState: { ...state.componentState, ifcSpacesHidden } };
};

const setNodesSelectionMap = (state = INITIAL_STATE, { nodesSelectionMap }) => {
	return { ...state, nodesSelectionMap: { ...nodesSelectionMap } };
};

const setAuxiliaryMaps = (state = INITIAL_STATE, { auxiliaryMaps }) => {
	return { ...state, ...auxiliaryMaps };
};

const setExpanedNodesMap = (state = INITIAL_STATE, { expandedNodesMap }) => {
	return { ...state, expandedNodesMap };
};

const updateDataRevision = (state) => {
	return { ...state, dataRevision: uniqueId('tree-data-rev-') };
};

const expandNode = (state = INITIAL_STATE, { id }) => {
	const newNode = { [id]: true };
	const expandedNodesMap = { ...state.expandedNodesMap, ...newNode };
	return { ...state, expandedNodesMap };
};

const resetComponentState = (state = INITIAL_STATE) => {
	return { ...state, componentState: INITIAL_STATE.componentState };
};

export const reducer = createReducer(INITIAL_STATE, {
	[TreeTypes.CLEAR_SELECTED_NODES]: clearSelectedNodes,
	[TreeTypes.GET_SELECTED_NODES_SUCCESS]: getSelectedNodesSuccess,
	[TreeTypes.SET_COMPONENT_STATE]: setComponentState,
	[TreeTypes.SET_IS_PENDING]: setIsPending,
	[TreeTypes.RESET_COMPONENT_STATE]: resetComponentState,
	[TreeTypes.SET_IFC_SPACES_HIDDEN]: setIfcSpacesHidden,
	[TreeTypes.SET_TREE_NODES_LIST]: setTreeNodesList,
	[TreeTypes.EXPAND_NODE]: expandNode,
	[TreeTypes.SET_NODES_SELECTION_MAP]: setNodesSelectionMap,
	[TreeTypes.SET_AUXILIARY_MAPS]: setAuxiliaryMaps,
	[TreeTypes.SET_EXPANED_NODES_MAP]: setExpanedNodesMap,
	[TreeTypes.UPDATE_DATA_REVISION]: updateDataRevision
});
