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

import { calculateTotalMeshes } from '../../helpers/tree';
import { searchByFilters } from '../../helpers/searching';
import { SELECTION_STATES, NODE_TYPES } from '../../constants/tree';

export const selectTreeDomain = (state) => Object.assign({}, state.tree);

export const selectSelectedNodes = createSelector(
	selectTreeDomain, (state) => state.selectedNodes
);

export const selectTreeNodesList = createSelector(
	selectTreeDomain, (state) => state.treeNodesList
);

export const selectTreeNodesIds = createSelector(
	selectTreeNodesList, (treeNodesList) => treeNodesList.map(({ _id }) => _id)
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

export const selectNodesSelectionMap = createSelector(
	selectTreeDomain, (state) => state.nodesSelectionMap
);

export const selectSelectedNodesIds = createSelector(
	selectNodesSelectionMap, (nodesSelectionMap) => {
		return keys(pickBy(nodesSelectionMap, (selectionState) => {
			return selectionState === SELECTION_STATES.SELECTED;
		}));
	}
);

export const selectUnselectedNodesIds = createSelector(
	selectNodesSelectionMap, (nodesSelectionMap) => {
		return keys(pickBy(nodesSelectionMap, (selectionState) => {
			return selectionState === SELECTION_STATES.UNSELECTED;
		}));
	}
);

export const selectNodesDefaultVisibilityMap = createSelector(
	selectTreeDomain, (state) => state.nodesDefaultVisibilityMap
);

export const selectNodesVisibilityMap = createSelector(
	selectTreeDomain, (state) => state.nodesVisibilityMap
);

export const selectNodesIndexesMap = createSelector(
	selectTreeDomain, (state) => state.nodesIndexesMap
);

export const selectNodesBySharedIdsMap = createSelector(
	selectTreeDomain, (state) => state.nodesBySharedIdsMap
);

export const selectMeshesByModelId = createSelector(
	selectTreeDomain, (state) => state.meshesByModelId
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

export const selectExpandedNodesMap = createSelector(
	selectTreeDomain, (state) => state.expandedNodesMap
);

export const selectNumberOfInvisibleChildrenMap = createSelector(
	selectTreeDomain, (state) => state.numberOfInvisibleChildrenMap
);

export const selectVisibleTreeNodesList = createSelector(
	[
		selectFilteredNodesList, selectNodesIndexesMap, selectSelectedFilters,
		selectExpandedNodesMap, selectSearchEnabled
	],
	(treeNodesList, nodesIndexesMap, selectedFilters, expandedNodesMap, searchEnabled) => {
		const visibleNodes = [];

		for (let index = 0; index < treeNodesList.length; index++) {
			const treeNode = { ...treeNodesList[index] };
			const isSearchActive = searchEnabled && selectedFilters.length;
			const isFirstLevel = treeNode.level === 1;
			const isSecondLevel = treeNode.level === 2;

			treeNode.parentIndex = nodesIndexesMap[treeNode.parentId];
			treeNode.isSearchResult = isSearchActive && !treeNode.isFederation && !treeNode.isModel;
			treeNode.isRegularNode = !isSearchActive && (isFirstLevel || isSecondLevel || expandedNodesMap[treeNode.parentId]);
			if (treeNode.isSearchResult || treeNode.isRegularNode) {
				visibleNodes.push(treeNode);
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

export const getSelectDeepChildren = (node) => createSelector(
	selectTreeNodesList, selectNodesIndexesMap,
	(treeNodesList, nodesIndexesMap) => {
		const nodeIndex = nodesIndexesMap[node._id];
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
