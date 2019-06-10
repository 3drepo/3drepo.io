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

import { createSelector } from 'reselect';
import { pickBy, keys, values, flatten, pick, uniq } from 'lodash';

import { SELECTION_STATES, NODE_TYPES, VISIBILITY_STATES } from '../../constants/tree';
import { calculateTotalMeshes } from '../../helpers/tree';
import { searchByFilters } from '../../helpers/searching';
import { TreeProcessingData } from './treeProcessing/treeProcessing.constants';
import TreeProcessing from './treeProcessing/treeProcessing';

export const selectTreeDomain = (state) => Object.assign({}, state.tree);

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

const selectTreeProccessing = () => TreeProcessing.data as TreeProcessingData;

export const selectTreeNodesList = createSelector(
	selectTreeProccessing, selectDataRevision,
	(treeProcessingData) => treeProcessingData.nodesList || []
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

export const selectSelectedNodesIds = createSelector(
	selectTreeProccessing, (treeProcessingData) => treeProcessingData.selectedNodesIds
);

export const selectDefaultVisibilityMap = createSelector(
	selectTreeProccessing, selectDataRevision,
	(treeProcessingData) => treeProcessingData.defaultVisibilityMap
);

export const selectVisibilityMap = createSelector(
	selectTreeProccessing, selectDataRevision,
	(treeProcessingData) => treeProcessingData.visibilityMap
);

export const selectInvisibleNodesIds = createSelector(
	selectTreeProccessing, (treeProcessingData) => treeProcessingData.invisibleNodesIds
);

export const selectNodesIndexesMap = createSelector(
	selectTreeProccessing, selectDataRevision,
	(treeProcessingData) => treeProcessingData.nodesIndexesMap
);

export const selectNodesBySharedIdsMap = createSelector(
	selectTreeProccessing, selectDataRevision,
	(treeProcessingData) => treeProcessingData.nodesBySharedIdsMap
);

export const selectMeshesByModelId = createSelector(
	selectTreeProccessing, selectDataRevision,
	(treeProcessingData) => treeProcessingData.meshesByModelId
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

export const selectIfcSpacesHidden = createSelector(
	selectComponentState, (state) => state.ifcSpacesHidden
);

export const selectDefaultHiddenNodesIds = createSelector(
	selectDefaultVisibilityMap, (nodesVisibilityMap) => {
		return keys(pickBy(nodesVisibilityMap, (selectionState) => {
			return selectionState === VISIBILITY_STATES.INVISIBLE;
		}));
	}
);

export const selectExpandedNodesMap = createSelector(
	selectTreeDomain, (state) => state.expandedNodesMap
);

export const selectVisibleTreeNodesList = createSelector(
	[
		selectFilteredNodesList, selectSelectedFilters,
		selectExpandedNodesMap, selectSearchEnabled
	],
	(treeNodesList, selectedFilters, expandedNodesMap, searchEnabled) => {
		const visibleNodes = [];
		const indexesByRootParentIds = {};

		for (let index = 0; index < treeNodesList.length; index++) {
			const treeNode = { ...treeNodesList[index] };

			const isSearchActive = searchEnabled && selectedFilters.length;
			const isFirstLevel = treeNode.level === 1;
			const isSecondLevel = treeNode.level === 2;

			treeNode.isSearchResult = isSearchActive && !treeNode.isFederation && !treeNode.isModel;
			treeNode.isRegularNode = !isSearchActive && (isFirstLevel || isSecondLevel || expandedNodesMap[treeNode.parentId]);
			if (treeNode.isSearchResult || treeNode.isRegularNode) {
				visibleNodes.push(treeNode);

				if (!treeNode.rootParentId) {
					indexesByRootParentIds[treeNode._id] = visibleNodes.length - 1;
				} else {
					treeNode.rootParentIndex = indexesByRootParentIds[treeNode.rootParentId];
				}
			}

		}

		return visibleNodes;
	}
);

export const getSelectNodesByIds = (nodesIds) => createSelector(
	selectTreeNodesList, selectNodesIndexesMap,
	(treeNodesList, nodesIndexesMap) => {
		return nodesIds.map((nodeId) => treeNodesList[nodesIndexesMap[nodeId]]);
	}
);

export const getSelectChildren = (node) => createSelector(
	getSelectNodesByIds(node.childrenIds),
	(children) => {
		if (!node) {
			throw new Error('Node does not exist');
		}

		if (node.hasChildren) {
			return children;
		}
		return [];
	}
);

export const getSelectDeepChildren = (nodeId) => createSelector(
	selectTreeNodesList, selectNodesIndexesMap,
	(treeNodesList, nodesIndexesMap) => {
		const nodeIndex = nodesIndexesMap[nodeId];
		const node = treeNodesList[nodeIndex];
		return treeNodesList.slice(nodeIndex + 1, nodeIndex + node.deepChildrenNumber + 1);
	}
);

export const getSelectParents = (node) => createSelector(
	selectTreeNodesList, selectNodesIndexesMap,
	(treeNodesList, nodesIndexesMap) => {
		const parents = [];

		let nextParentId = node.parentId;

		while (!!nextParentId) {
			const parentNodeIndex = nodesIndexesMap[nextParentId];
			const parentNode = treeNodesList[parentNodeIndex];
			parents.push(parentNode);
			nextParentId = parentNode.parentId;
		}

		return parents;
	}
);

export const getSelectMeshesByNodes = (nodes = []) => createSelector(
	selectTreeNodesList, selectNodesIndexesMap, selectMeshesByModelId,
	(treeNodesList, nodesIndexesMap, idToMeshes) => {
		if (!nodes.length) {
			return [];
		}

		const childrenMap = {};
		const meshesByNodes = {};

		let stack = [...nodes];
		while (stack.length > 0) {
			const node = stack.pop();

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
				meshesByNodes[node.namespacedId].meshes = meshesByNodes[node.namespacedId].meshes.concat(meshes);
			} else if (!childrenMap[node._id] && node.hasChildren) {
				// This should only happen in federations.
				// Traverse down the tree to find submodel nodes
				const nodeIndex = nodesIndexesMap[node._id];
				for (let childNumber = 1; childNumber <= node.deepChildrenNumber; childNumber++) {
					const childNode = treeNodesList[nodeIndex + childNumber];
					childrenMap[childNode._id] = true;
					stack = stack.concat([childNode]);
				}
			}
		}

		return values(meshesByNodes);
	}
);

export const getSelectNodesIdsFromSharedIds = (objects = []) => createSelector(
	selectNodesBySharedIdsMap,
	(nodesBySharedIds) => {
		if (!objects.length) {
			return [];
		}
		const objectsSharedIds = objects.map(({ shared_ids }) => shared_ids);
		const sharedIds = flatten(objectsSharedIds) as string[];
		const nodesIdsBySharedIds = values(pick(nodesBySharedIds, sharedIds));
		return uniq(nodesIdsBySharedIds);
	}
);
