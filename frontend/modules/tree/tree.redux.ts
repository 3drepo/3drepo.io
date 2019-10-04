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

import { uniqueId } from 'lodash';
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
	isolateSelectedNodes: ['nodeId'],
	hideIfcSpaces: [],
	setComponentState: ['componentState'],
	resetComponentState: [],
	setIfcSpacesHidden: ['ifcSpacesHidden'],
	expandNodes: ['nodesIds'],
	collapseNodes: ['nodesIds'],
	setIsPending: ['isPending'],
	setTreeNodesVisibility: ['nodesIds', 'visibility', 'skipChildren', 'skipParents'],
	setSelectedNodesVisibility: ['nodeId', 'visibility'],
	handleNodesClick: ['nodesIds', 'skipExpand'],
	handleNodesClickBySharedIds: ['objects'],
	handleBackgroundClick: [],
	setAuxiliaryMaps: ['auxiliaryMaps'],
	setNodesSelectionMap: ['nodesSelectionMap'],
	showNodesBySharedIds: ['objects'],
	selectNodes: ['nodesIds', 'skipExpand', 'skipChildren', 'colour'],
	selectNodesBySharedIds: ['objects', 'colour'],
	deselectNodesBySharedIds: ['objects'],
	deselectNodes: ['nodesIds'],
	isolateNodesBySharedIds: ['objects'],
	hideNodesBySharedIds: ['objects'],
	clearCurrentlySelected: [],
	setExpandedNodesMap: ['expandedNodesMap'],
	updateDataRevision: [],
	setActiveNode: ['nodeId'],
	goToRootNode: ['nodeId'],
	zoomToHighlightedNodes: [],
	handleColorOverridesChange: ['currentOverrides', 'previousOverrides']
}, { prefix: 'TREE/' });

export interface ITreeComponentState {
	selectedFilters: any[];
	searchEnabled: boolean;
	ifcSpacesHidden: boolean;
	activeNode: string;
}

export interface ITreeState {
	selectedNodes: any;
	treeNodesList: any[];
	expandedNodesMap: any;
	isPending?: boolean;
	dataRevision: string;
	componentState: ITreeComponentState;
}

export const INITIAL_STATE: ITreeState = {
	selectedNodes: [],
	treeNodesList: [],
	isPending: true,
	expandedNodesMap: {},
	dataRevision: null,
	componentState: {
		selectedFilters: [],
		searchEnabled: false,
		ifcSpacesHidden: true,
		activeNode: null
	}
};

const clearSelectedNodes = (state = INITIAL_STATE, {}) => {
	return { ...state, selectedNodes: [] };
};

const getSelectedNodesSuccess = (state = INITIAL_STATE, { selectedNodes }) => {
	return { ...state, selectedNodes };
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

const setExpandedNodesMap = (state = INITIAL_STATE, { expandedNodesMap }) => {
	return { ...state, expandedNodesMap };
};

const updateDataRevision = (state) => {
	return { ...state, dataRevision: uniqueId('tree-data-rev-') };
};

const expandNodes = (state = INITIAL_STATE, { nodesIds }) => {
	const expandedNodesMap = { ...state.expandedNodesMap };
	for (let index = 0; index < nodesIds.length; index++) {
		expandedNodesMap[nodesIds[index]] = true;
	}
	return { ...state, expandedNodesMap };
};

const resetComponentState = (state = INITIAL_STATE) => {
	return { ...state, componentState: INITIAL_STATE.componentState };
};

const setActiveNode = (state = INITIAL_STATE, { nodeId }) => {
	return { ...state, activeNode: nodeId };
};

export const reducer = createReducer(INITIAL_STATE, {
	[TreeTypes.CLEAR_SELECTED_NODES]: clearSelectedNodes,
	[TreeTypes.GET_SELECTED_NODES_SUCCESS]: getSelectedNodesSuccess,
	[TreeTypes.SET_COMPONENT_STATE]: setComponentState,
	[TreeTypes.SET_IS_PENDING]: setIsPending,
	[TreeTypes.RESET_COMPONENT_STATE]: resetComponentState,
	[TreeTypes.SET_IFC_SPACES_HIDDEN]: setIfcSpacesHidden,
	[TreeTypes.EXPAND_NODES]: expandNodes,
	[TreeTypes.SET_NODES_SELECTION_MAP]: setNodesSelectionMap,
	[TreeTypes.SET_AUXILIARY_MAPS]: setAuxiliaryMaps,
	[TreeTypes.SET_EXPANDED_NODES_MAP]: setExpandedNodesMap,
	[TreeTypes.UPDATE_DATA_REVISION]: updateDataRevision,
	[TreeTypes.SET_ACTIVE_NODE]: setActiveNode
});
