/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import _ from 'lodash';
import { BACKEND_VISIBILITY_STATES, NODE_TYPES, SELECTION_STATES, VISIBILITY_STATES } from '../../../constants/tree';
import { DEFAULT_NODE_NAME, INode } from './treeProcessing.constants';

const isModelNode = (level, isFederation, hasFederationAsParent?) => {
	return (level === 1 && !isFederation) || (level === 2 && hasFederationAsParent);
};

const getNamespacedId = (node) => {
	const { account, model, project } = node;
	return `${account}@${model || project}`;
};

const getTransformedNodeData = (node) => ({
	_id: node._id,
	name: node.type === NODE_TYPES.TRANSFORMATION && !node.name ? DEFAULT_NODE_NAME : node.name,
	type: node.type,
	teamspace: node.account,
	meta: node.meta || [],
	model: node.model || node.project,
	shared_id: node.shared_id,
	defaultVisibility: node.toggleState && BACKEND_VISIBILITY_STATES[node.toggleState]
		? BACKEND_VISIBILITY_STATES[node.toggleState] : VISIBILITY_STATES.VISIBLE
});

const getFlattenNested = (tree, maps, data = [], idx = 0, level = 1, parentId = null, rootParentId = null) => {
	const rowData: INode = {
		...getTransformedNodeData(tree),
		namespacedId: getNamespacedId(tree),
		isFederation: tree.isFederation,
		isModel: tree.isModel || isModelNode(level, tree.isFederation),
		level,
		parentId,
		rootParentId,
		hasChildren: Boolean(tree.children),
		expandable: false,
		deepChildrenNumber: 0,
		childrenIds: [],
		subTreeRoots: []
	};

	const nodeID = rowData._id;
	const currentNodeIdx = idx;
	data.push(rowData);
	maps.nodesIndexesMap[nodeID] = idx++;
	let subTreeRoots = [];
	if (tree.children) {
		tree.children = _.orderBy(tree.children, ({ name }) => name?.toLowerCase());
		const hasChildren = tree.children.length;
		rowData.hasChildren = hasChildren;
		rowData.expandable = tree.children.some((child) => Boolean(child.name) || child.type === NODE_TYPES.TRANSFORMATION);
		rootParentId = rowData.isModel ? nodeID : rootParentId;

		let nHiddenChildren = 0;
		rowData.defaultVisibility = rowData.defaultVisibility || VISIBILITY_STATES.VISIBLE;
		for (let index = 0; index < tree.children.length; index++) {

			const subTree = tree.children[index];
			subTree.isModel = isModelNode(level + 1, subTree.isFederation, tree.isFederation);

			const { deepChildrenNumber, visibility, nextIdx, subTreeRoots: childrenSubTreeRoots } =
				getFlattenNested(subTree, maps, data, idx, level + 1, nodeID, rootParentId);
			rowData.deepChildrenNumber += deepChildrenNumber;
			idx = nextIdx;
			rowData.childrenIds.push(subTree._id);

			if (visibility === VISIBILITY_STATES.INVISIBLE) {
				++nHiddenChildren;
				rowData.defaultVisibility = VISIBILITY_STATES.PARENT_OF_INVISIBLE;
			} else if (visibility === VISIBILITY_STATES.PARENT_OF_INVISIBLE) {
				rowData.defaultVisibility = VISIBILITY_STATES.PARENT_OF_INVISIBLE;
			}

			subTreeRoots = [...subTreeRoots, ...childrenSubTreeRoots];
			const childNS = getNamespacedId(subTree);
			if (childNS !== rowData.namespacedId) {
				subTreeRoots.push(subTree._id);
			}
		}

		if (hasChildren && nHiddenChildren === tree.children.length) {
			rowData.defaultVisibility = VISIBILITY_STATES.INVISIBLE;
		}

	}

	rowData.subTreeRoots = subTreeRoots;
	maps.nodesVisibilityMap[nodeID] = maps.nodesDefaultVisibilityMap[nodeID] = rowData.defaultVisibility;
	maps.nodesSelectionMap[nodeID] = SELECTION_STATES.UNSELECTED;
	maps.nodesBySharedIdsMap[rowData.shared_id] = nodeID;

	return { data, deepChildrenNumber: data.length - currentNodeIdx,
		visibility: rowData.defaultVisibility, nextIdx: idx, subTreeRoots };
};

const getMeshesByNodeId = (modelsWithMeshes) => {
	const meshesByNodeId = {};
	for (let index = 0; index < modelsWithMeshes.length; index++) {
		const modelWithMeshes = modelsWithMeshes[index];
		const { account, model: modelId } = modelWithMeshes;
		delete modelWithMeshes.account;
		delete modelWithMeshes.model;
		meshesByNodeId[`${account}@${modelId}`] = modelWithMeshes;
	}
	return meshesByNodeId;
};

export default ({ mainTree, subTrees, subModels, meshMap, treePath }) => new Promise((resolve, reject) => {
	try {
		const subModelsRootNodes = {};

		if (subModels.length) {
			// main tree is a federation, find all the refs and identify root nodes for each reference.
			const nodesToCheck = [...mainTree.children];

			while (nodesToCheck.length) {
				const currentNode = nodesToCheck.pop();
				if (currentNode.type === "ref") {
					const subModelId = currentNode.name;
					const subModel = subModels.find(({ model }) => subModelId === model);
					if (subModel) {
						currentNode.name = subModel.name
						subModelsRootNodes[subModelId] = currentNode;

						const subTree = subTrees.find(({ nodes }) => nodes.project === subModelId);
						currentNode.children = subTree ? [subTree.nodes] : [];
					}
				} else if (currentNode.children?.length) {
					nodesToCheck.push(...currentNode.children);
				}
			}
		}

		const auxiliaryMaps = {
			nodesIndexesMap: {},
			nodesVisibilityMap: {},
			nodesSelectionMap: {},
			nodesBySharedIdsMap: {},
			nodesDefaultVisibilityMap: {}
		} as any;

		const { data: nodesList } = getFlattenNested(mainTree, auxiliaryMaps);
		const meshesByNodeId = getMeshesByNodeId(meshMap);
		resolve({ nodesList, meshesByNodeId, treePath, subModelsRootNodes, ...auxiliaryMaps });
	} catch (error) {
		reject(error);
	}
});
