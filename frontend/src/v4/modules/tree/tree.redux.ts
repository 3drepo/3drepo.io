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
	setSelectedObjectsSuccess: ['selectedObjects'],
	showAllNodes: [],
	hideSelectedNodes: [],
	isolateSelectedNodes: ['nodeId'],
	showHiddenGeometry: [],
	setComponentState: ['componentState'],
	resetComponentState: [],
	setHiddenGeometryVisible: ['hiddenGeometryVisible'],
	expandNodes: ['nodesIds'],
	collapseNodes: ['nodesIds'],
	setIsPending: ['isPending'],
	setSubmodelsVisibility: ['models', 'visibility'],
	setTreeNodesVisibility: ['nodesIds', 'visibility', 'skipChildren', 'skipParents'],
	setSelectedNodesVisibility: ['nodeId', 'visibility'],
	handleNodesClick: ['nodesIds', 'skipExpand'],
	handleNodesClickBySharedIds: ['objects'],
	handleBackgroundClick: [],
	setAuxiliaryMaps: ['auxiliaryMaps'],
	setNodesSelectionMap: ['nodesSelectionMap'],
	showNodesBySharedIds: ['objects'],
	selectNodes: ['nodesIds', 'skipExpand', 'skipChildren', 'skipSelecting', 'colour'],
	selectNodesBySharedIds: ['objects', 'colour'],
	deselectNodesBySharedIds: ['objects'],
	deselectNodes: ['nodesIds'],
	isolateNodesBySharedIds: ['objects'],
	hideNodesBySharedIds: ['objects', 'resetTree'],
	clearCurrentlySelected: ['keepMetadataOpen'],
	setExpandedNodesMap: ['expandedNodesMap'],
	updateDataRevision: [],
	setActiveNode: ['nodeId'],
	goToRootNode: ['nodeId'],
	zoomToHighlightedNodes: [],
	handleTransparencyOverridesChange: ['currentOverrides', 'previousOverrides'],
	setIsTreeProcessed: ['isTreeProcessed'],
	handleTransparenciesVisibility: ['transparencies'],
}, { prefix: 'TREE/' });

export interface ITreeComponentState {
	selectedFilters: any[];
	searchEnabled: boolean;
	hiddenGeometryVisible: boolean;
	activeNode: string;
}

export interface ITreeState {
	selectedObjects: any;
	treeNodesList: any[];
	expandedNodesMap: any;
	isPending?: boolean;
	dataRevision: string;
	isTreeProcessed: boolean;
	componentState: ITreeComponentState;
}

export const INITIAL_STATE: ITreeState = {
	selectedObjects: [],
	treeNodesList: [],
	isPending: true,
	expandedNodesMap: {},
	dataRevision: null,
	isTreeProcessed: false,
	componentState: {
		selectedFilters: [],
		searchEnabled: false,
		hiddenGeometryVisible: false,
		activeNode: null
	}
};

const setSelectedObjects = (state = INITIAL_STATE, { selectedObjects }) => {
	return { ...state, selectedObjects };
};

const setIsPending = (state = INITIAL_STATE, { isPending }) => ({ ...state, isPending });

const setComponentState = (state = INITIAL_STATE, { componentState = {} }) => {
	return { ...state, componentState: { ...state.componentState, ...componentState } };
};

const setHiddenGeometryVisible = (state = INITIAL_STATE, { hiddenGeometryVisible }) => {
	return { ...state, componentState: { ...state.componentState, hiddenGeometryVisible } };
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

const setIsTreeProcessed = (state = INITIAL_STATE, { isTreeProcessed }) => {
	return { ...state, isTreeProcessed };
};

export const reducer = createReducer(INITIAL_STATE, {
	[TreeTypes.SET_SELECTED_OBJECTS_SUCCESS]: setSelectedObjects,
	[TreeTypes.SET_COMPONENT_STATE]: setComponentState,
	[TreeTypes.SET_IS_PENDING]: setIsPending,
	[TreeTypes.RESET_COMPONENT_STATE]: resetComponentState,
	[TreeTypes.SET_HIDDEN_GEOMETRY_VISIBLE]: setHiddenGeometryVisible,
	[TreeTypes.EXPAND_NODES]: expandNodes,
	[TreeTypes.SET_NODES_SELECTION_MAP]: setNodesSelectionMap,
	[TreeTypes.SET_AUXILIARY_MAPS]: setAuxiliaryMaps,
	[TreeTypes.SET_EXPANDED_NODES_MAP]: setExpandedNodesMap,
	[TreeTypes.UPDATE_DATA_REVISION]: updateDataRevision,
	[TreeTypes.SET_ACTIVE_NODE]: setActiveNode,
	[TreeTypes.SET_IS_TREE_PROCESSED]: setIsTreeProcessed
});
