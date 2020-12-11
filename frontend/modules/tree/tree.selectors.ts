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

import { flatten, pick, uniq, values } from 'lodash';
import { createSelector } from 'reselect';

import { NODE_TYPES, VISIBILITY_STATES } from '../../constants/tree';
import { mergeArrays } from '../../helpers/arrays';
import { searchByFilters } from '../../helpers/searching';
import { calculateTotalMeshes } from '../../helpers/tree';

import TreeProcessing from './treeProcessing/treeProcessing';
import { ITreeProcessingData } from './treeProcessing/treeProcessing.constants';

export const selectTreeDomain = (state) => ({...state.tree});

export const selectSelectedNodes = createSelector(
	selectTreeDomain, (state) => state.selectedNodes
);

export const selectIsPending = createSelector(
	selectTreeDomain, (state) => state.isPending
);

export const selectTotalMeshes = createSelector(
	selectSelectedNodes, (selectedNodes) => calculateTotalMeshes(selectedNodes)
);

export const selectComponentState = createSelector(
	selectTreeDomain, (state) => state.componentState
);

export const selectDataRevision = createSelector(
	selectTreeDomain, (state) => state.dataRevision
);

export const selectActiveNode = createSelector(
	selectTreeDomain, (state) => state.activeNode
);

const selectTreeProccessing = () => TreeProcessing.data as ITreeProcessingData;

export const selectTreeNodesList = createSelector(
	selectTreeProccessing, selectDataRevision,
	(treeProcessingData) => treeProcessingData.nodesList || []
);

export const selectSubModelsRootNodes = createSelector(
	selectTreeProccessing, selectDataRevision,
	(treeProcessingData) => treeProcessingData.subModelsRootNodes || []
);

export const selectIsFederation = createSelector(
	selectTreeNodesList, (treeNodesList) => {
		const rootNode = treeNodesList[0];
		if (rootNode) {
			return rootNode.isFederation;
		}

		return false;
	}
);

export const selectTreeNodesIds = createSelector(
	selectTreeNodesList, selectDataRevision,
	(treeNodesList) => treeNodesList.map(({ _id }) => _id)
);

export const selectSelectionMap = createSelector(
	selectTreeProccessing, selectDataRevision,
	(treeProcessingData) => treeProcessingData.selectionMap
);

export const selectFullySelectedNodesIds = createSelector(
	selectTreeProccessing, selectDataRevision, (treeProcessingData) => treeProcessingData.fullySelectedNodesIds || []
);

export const selectDefaultVisibilityMap = createSelector(
	selectTreeProccessing, selectDataRevision,
	(treeProcessingData) => treeProcessingData.defaultVisibilityMap
);

export const selectVisibilityMap = createSelector(
	selectTreeProccessing, selectDataRevision,
	(treeProcessingData) => treeProcessingData.visibilityMap
);

export const selectNodesIndexesMap = createSelector(
	selectTreeProccessing, selectDataRevision,
	(treeProcessingData) => treeProcessingData.nodesIndexesMap
);

export const selectNodesBySharedIdsMap = createSelector(
	selectTreeProccessing, selectDataRevision,
	(treeProcessingData) => treeProcessingData.nodesBySharedIdsMap
);

export const selectMeshesByNodeId = createSelector(
	selectTreeProccessing, selectDataRevision,
	(treeProcessingData) => treeProcessingData.meshesByNodeId
);

export const selectSelectedFilters = createSelector(
	selectComponentState, (state) => state.selectedFilters
);

export const selectFilteredNodesList = createSelector(
	selectTreeNodesList, selectSelectedFilters, (nodes, selectedFilters) => {
		if (!selectedFilters.length) {
			return nodes;
		}
		return searchByFilters(nodes, selectedFilters, true);
	}
);

export const selectSearchEnabled = createSelector(
	selectComponentState, (state) => state.searchEnabled
);

export const selectHiddenGeometryVisible = createSelector(
	selectComponentState, (state) => state.hiddenGeometryVisible
);

export const selectDefaultHiddenNodesIds = createSelector(
	selectTreeNodesList, selectDefaultVisibilityMap, (nodes, nodesVisibilityMap) => {
		let idx = 0;
		const res = [];

		while (idx < nodes.length) {
			const node = nodes[idx];
			const nodeID = node._id;
			if (node.type === 'mesh' && nodesVisibilityMap[nodeID] === VISIBILITY_STATES.INVISIBLE) {
				res.push(nodeID);
			} else if (nodesVisibilityMap[nodeID] === VISIBILITY_STATES.VISIBLE) {
				idx += node.deepChildrenNumber;
			}

			++idx;
		}

		return res;

	}
);

export const selectExpandedNodesMap = createSelector(
	selectTreeDomain, selectDataRevision, (state) => state.expandedNodesMap
);

export const selectVisibleTreeNodesList = createSelector(
	[
		selectFilteredNodesList, selectSelectedFilters,
		selectExpandedNodesMap, selectSearchEnabled, selectDataRevision
	],
	(treeNodesList, selectedFilters, expandedNodesMap, searchEnabled) => {
		const visibleNodes = [];
		const indexesByRootParentIds = {};

		const isSearchActive = searchEnabled && selectedFilters.length;
		let index = 0;
		while (index < treeNodesList.length) {
			const treeNode = { ...treeNodesList[index] };

			treeNode.isSearchResult = isSearchActive && !treeNode.isFederation && !treeNode.isModel;
			treeNode.isRegularNode = !isSearchActive && (treeNode.level <= 2 || expandedNodesMap[treeNode.parentId]);
			const isNamelessMesh = treeNode.type === 'mesh' && !treeNode.name;
			if (!isNamelessMesh && (treeNode.isSearchResult || treeNode.isRegularNode)) {
				visibleNodes.push(treeNode);

				if (!treeNode.rootParentId) {
					indexesByRootParentIds[treeNode._id] = visibleNodes.length - 1;
				} else {
					treeNode.rootParentIndex = indexesByRootParentIds[treeNode.rootParentId];
				}
			} else if (!treeNode.isSearchResult && treeNode.deepChildrenNumber) {
				// If we are not showing search result and this node isn't a regular node,
				// Then we are certain we won't be showing its children, skip them.
				index += treeNode.deepChildrenNumber;
			}
			++index;
		}
		return visibleNodes;
	}
);

export const selectGetNodesByIds = (nodesIds) => createSelector(
	selectTreeNodesList, selectNodesIndexesMap,
	(treeNodesList, nodesIndexesMap) => {
		return nodesIds.map((nodeId) => treeNodesList[nodesIndexesMap[nodeId]]);
	}
);

export const selectGetDeepChildren = (nodeId) => createSelector(
	selectTreeNodesList, selectNodesIndexesMap,
	(treeNodesList, nodesIndexesMap) => {
		const nodeIndex = nodesIndexesMap[nodeId];
		const node = treeNodesList[nodeIndex];
		return treeNodesList.slice(nodeIndex + 1, nodeIndex + node.deepChildrenNumber + 1);
	}
);

export const selectGetMeshesByIds = (nodesIds = []) => createSelector(
	selectTreeNodesList, selectNodesIndexesMap, selectMeshesByNodeId,
	(treeNodesList, nodesIndexesMap, idToMeshes) => {
		if (!nodesIds.length) {
			return [];
		}

		const childrenMap = {};
		const meshesByNodes = {};

		let stack = [...nodesIds];
		while (stack.length > 0) {
			const nodeId = stack.pop();
			const nodeIndex = nodesIndexesMap[nodeId];
			const node = treeNodesList[nodeIndex] as any;

			if (node) {
				if (!meshesByNodes[node.namespacedId]) {
					meshesByNodes[node.namespacedId] = {
						modelId: node.model,
						teamspace: node.teamspace,
						meshes: []
					};
				}

				// Check top level and then check if sub model of fed
				let meshes = node.type === NODE_TYPES.MESH
					? [node._id]
					: idToMeshes[node._id];

				if (!meshes && idToMeshes[node.namespacedId]) {
					meshes = idToMeshes[node.namespacedId][node._id];
				}

				if (meshes) {
					mergeArrays(meshesByNodes[node.namespacedId].meshes, meshes);
				} else if (!childrenMap[node._id] && node.hasChildren) {
					// This should only happen in federations.
					// Traverse down the tree to find submodel nodes
					for (let childNumber = 1; childNumber <= node.deepChildrenNumber; ++childNumber) {
						const childNode = treeNodesList[nodeIndex + childNumber];
						childrenMap[childNode._id] = true;
						stack = stack.concat([childNode]);
					}
				}
			}

		}

		return values(meshesByNodes);
	}
);

export const selectGetNodesIdsFromSharedIds = (objects = []) => createSelector(
	selectNodesBySharedIdsMap,
	(nodesBySharedIds) => {
		if (!objects.length) {
			return [];
		}

		const ids = new Set();
		objects.forEach((obj) => {
			obj.shared_ids.forEach((sharedId) => {
				const id = nodesBySharedIds[sharedId];
				if (id) {
					ids.add(id);
				}
			});
		});
		return Array.from(ids);
	}
);

export const selectVisibleTreeNodesIds = createSelector(
	selectVisibleTreeNodesList,
	(visibleNodes) => visibleNodes.map((visibleNode) => visibleNode._id)
);

export const selectIsTreeProcessed = createSelector(
	selectTreeDomain, (state) => state.isTreeProcessed
);
