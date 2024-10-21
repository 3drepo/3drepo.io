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

import { isEmpty, orderBy, values } from 'lodash';
import { createSelector } from 'reselect';
import { selectUsername } from '@/v5/store/currentUser/currentUser.selectors';

import { NODE_TYPES, VISIBILITY_STATES } from '../../constants/tree';
import { mergeArrays } from '../../helpers/arrays';
import { searchByFilters } from '../../helpers/searching';
import TreeProcessing from './treeProcessing/treeProcessing';

const selectTreeProccessing = () => TreeProcessing.data;

export const selectTreeDomain = (state) => ({...state.tree});

// This is used by other selectors, although the data seems not to be used.
// The reason is that "dataRevision" acts as an ID that changes when
// the visibility of some nodes changes. So doing, it forces the other
// selectors to recompute the returned data as opposed to what they have
// "cached" (selectors do a comparison on the data to return to decide whether
// or not to trigger state refresh).
export const selectDataRevision = createSelector(
	selectTreeDomain, (state) => state.dataRevision
);

export const selectTreeNodesList = createSelector(
	selectTreeProccessing, selectDataRevision,
	(treeProcessingData) => treeProcessingData.nodesList || []
);

export const selectSelectedObjects = createSelector(
	selectTreeDomain, (state) => state.selectedObjects || []
);

export const selectSelectedNodes = createSelector(
	selectTreeProccessing,
	selectSelectedObjects,
	(treeProcessing, objects) => objects.map((o) => ({
		model: o.modelId,
		account: o.teamspace,
		shared_ids: o.meshes.map((meshId) => treeProcessing.nodesList[treeProcessing.nodesIndexesMap[meshId]]?.shared_id),
	})),
);

export const selectGetSharedIdsFromNodeIds = createSelector(
	selectTreeNodesList,
	(state, nodeIds: string[]) => nodeIds,
	(nodesList, nodeIds) => {
		const nodesSet = new Set(nodeIds);
		return nodesList.reduce((sharedIds, currentNode) => {
			if (nodesSet.has(currentNode._id)) {
				sharedIds.push(currentNode.shared_id);
			}
			return sharedIds;
		}, []);
	}
);

export const selectIsPending = createSelector(
	selectTreeDomain, (state) => state.isPending
);

export const selectComponentState = createSelector(
	selectTreeDomain, (state) => state.componentState
);

export const selectActiveNode = createSelector(
	selectTreeDomain, (state) => state.activeNode
);

export const selectSortedTreeNodesList = createSelector(
	selectTreeNodesList,
	(nodesList) => orderBy(nodesList, ({ name }) => name?.toLowerCase()),
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
	selectTreeNodesList, selectSortedTreeNodesList, selectSelectedFilters,
	(nodes, sortedNodes, selectedFilters) => {
		if (!selectedFilters.length) {
			return nodes;
		}
		return searchByFilters(sortedNodes, selectedFilters, true);
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

			treeNode.isSearchResult = isSearchActive && treeNode.level > 1;
			treeNode.isRegularNode = !isSearchActive && (treeNode.level <= 2 || expandedNodesMap[treeNode.parentId]);
			const isNamelessMesh = treeNode.type === 'mesh' && !treeNode.name;
			if (!isNamelessMesh && (treeNode.isSearchResult || treeNode.isRegularNode)) {
				visibleNodes.push(treeNode);

				if (!treeNode.rootParentId) {
					indexesByRootParentIds[treeNode._id] = visibleNodes.length - 1;
				} else {
					treeNode.rootParentIndex = indexesByRootParentIds[treeNode.rootParentId];
				}
			} else if (!treeNode.isSearchResult && treeNode.deepChildrenNumber && treeNode.level > 1) {
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

export const selectNodesByMeshSharedIdsArray = createSelector(
	selectTreeNodesList,
	selectNodesIndexesMap,
	selectNodesBySharedIdsMap,
	(state, meshes) => meshes,
	(nodeList, nodeMap, nodesBySharedIds, meshes) => {
		if (!(nodeList && nodeMap && nodesBySharedIds)) {
			return meshes;
		}
		const foundNodes = new Set();

		meshes.forEach((mesh) => {
			const meshId = nodesBySharedIds[mesh];
			if (meshId && nodeList[nodeMap[meshId]]) {
				const meshEntry = nodeList[nodeMap[meshId]];
				foundNodes.add(meshEntry.name && meshEntry.name.length ? meshEntry._id : meshEntry.parentId);
			}
		});

		return Array.from(foundNodes);
	}
);

export const selectNumNodesByMeshSharedIdsArray = createSelector(
	selectNodesByMeshSharedIdsArray,
	(nodes) => nodes.length
);

export const selectSelectedObjectsCount = createSelector(
	selectSelectedNodes,
	(state) => (meshes) => selectNodesByMeshSharedIdsArray(state, meshes),
	(selectedNodes, getNodesByMeshSharedIdsArray) => {
		const sharedIds = selectedNodes.flatMap((node) => node.shared_ids);
		return getNodesByMeshSharedIdsArray(sharedIds).length;
	}
);

type MyObject = {
	shared_ids: string[]
}
export const selectGetNodesIdsFromSharedIds = (objects: MyObject[] = []) => createSelector(
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

export const selectModelHasHiddenNodes = createSelector(
	selectSubModelsRootNodes,
	selectUsername,
	selectTreeNodesList,
	selectVisibilityMap,
	selectDefaultVisibilityMap,
	selectMeshesByNodeId,
	selectHiddenGeometryVisible,
	selectDataRevision,
	(subModelsRootNodes, username, nodesList = [], visibilityMap = {}, defaultVisibilityMap = {}, meshesByNodeId, isHiddenGeometryVisible) => {
		if (!username || !nodesList.length || isEmpty(visibilityMap)) {
			return null;
		}

		let meshes;
		const [root] = nodesList;
		if (isEmpty(subModelsRootNodes)) {
			meshes = meshesByNodeId[root.namespacedId][root._id];
		} else {
			const subModelsMeshesById: Array<Record<string, string[]>> = Object.entries(subModelsRootNodes).flatMap(([modelId, node]: any) => (
				node.children.length ? meshesByNodeId[`${root.teamspace}@${modelId}`] : []
			));
			meshes = root.subTreeRoots.flatMap((modelId) => (
				subModelsMeshesById.flatMap((subModelMeshes) => subModelMeshes[modelId] || [])
			));
		}
		return meshes.some((id) => (visibilityMap[id] !== VISIBILITY_STATES.VISIBLE && (isHiddenGeometryVisible || defaultVisibilityMap[id] !== VISIBILITY_STATES.INVISIBLE)));
	}
);
