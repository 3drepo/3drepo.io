import { intersection, keys, pickBy, pick, values, memoize } from 'lodash';
import { VISIBILITY_STATES, SELECTION_STATES, NODE_TYPES } from '../../../../constants/tree';
import { ACTION_TYPES } from '../treeProcessing.constants';
import { IS_DEVELOPMENT } from '../../../../constants/environment';

const localData = {
	nodesList: [],
	nodesIndexesMap: {},
	defaultVisibilityMap: {},
	meshesByModelId: {}
};

const setLocalData = ({ nodesList, nodesIndexesMap, defaultVisibilityMap }) => {
	localData.nodesList = nodesList;
	localData.nodesIndexesMap = nodesIndexesMap;
	localData.defaultVisibilityMap = defaultVisibilityMap;
};

const getSelectedNodesIds = (nodesSelectionMap) => {
	return keys(pickBy(nodesSelectionMap, (selectionState) => {
		return selectionState === SELECTION_STATES.SELECTED;
	}));
};

const getNodesByIds = (nodesIds) => {
	return nodesIds.map((nodeId) => localData.nodesList[localData.nodesIndexesMap[nodeId]]);
};

const getDeepChildren = memoize((node) => {
	const nodeIndex = localData.nodesIndexesMap[node._id];
	return localData.nodesList.slice(nodeIndex + 1, nodeIndex + node.deepChildrenNumber + 1);
}, (node) => node._id);

export const getChildren = memoize((node) => {
	if (!node) {
		throw new Error('Node does not exist');
	}

	if (node.hasChildren) {
		return getNodesByIds(node.childrenIds);
	}

	return [];
}, (node) => node._id);

const getParents = memoize((node) => {
	const parents = [];

	let nextParentId = node.parentId;

	while (!!nextParentId) {
		const parentNodeIndex = localData.nodesIndexesMap[nextParentId];
		const parentNode = localData.nodesList[parentNodeIndex];
		parents.push(parentNode);
		nextParentId = parentNode.parentId;
	}

	return parents;
}, (node) => node._id);

const updateParentsVisibility = (nodes = [], extraData) => {
	const nodesVisibilityMap = { ...extraData.nodesVisibilityMap };
	const nodesSelectionMap = {};
	const unhighlightedObjects = [];

	const processedNodes = [];

	while (nodes.length > 0) {
		const node = nodes.pop();
		processedNodes.push(node._id);
		const initialVisibility = extraData.nodesVisibilityMap[node._id];

		if (node.hasChildren) {
			const children = getChildren(node);
			let visibleChildCount = 0;
			let hasParentOfInvisibleChild = false;

			for (let i = 0; i < children.length; i++) {
				if (nodesVisibilityMap[children[i]._id] === VISIBILITY_STATES.PARENT_OF_INVISIBLE) {
					hasParentOfInvisibleChild = true;
					break;
				} else if (nodesVisibilityMap[children[i]._id] === VISIBILITY_STATES.PARENT_OF_INVISIBLE) {
					break;
				} else if (nodesVisibilityMap[children[i]._id] === VISIBILITY_STATES.VISIBLE) {
					visibleChildCount++;
				}
			}

			if (hasParentOfInvisibleChild) {
				nodesVisibilityMap[node._id] = VISIBILITY_STATES.PARENT_OF_INVISIBLE;
			} else if (children.length && children.length === visibleChildCount) {
				nodesVisibilityMap[node._id] = VISIBILITY_STATES.VISIBLE;
			} else if (!visibleChildCount) {
				nodesSelectionMap[node._id] = SELECTION_STATES.UNSELECTED;
				nodesVisibilityMap[node._id] = VISIBILITY_STATES.INVISIBLE;
				const meshesByNodes = getSelectMeshesByNodes([node]);
				const meshesData = meshesByNodes[0];
				unhighlightedObjects.push(...meshesData);
			} else {
				nodesVisibilityMap[node._id] = VISIBILITY_STATES.PARENT_OF_INVISIBLE;
			}
		} else {
			nodesVisibilityMap[node._id] = extraData.visibility;
		}

		if (initialVisibility !== nodesVisibilityMap[node._id] && node.parentId) {
			const parents = getParents(node);

			if (VISIBILITY_STATES.PARENT_OF_INVISIBLE === nodesVisibilityMap[node._id]) {
				for (let j = 0; j < parents.length; j++) {
					const parentNode = parents[j];
					nodesVisibilityMap[parentNode._id] = VISIBILITY_STATES.PARENT_OF_INVISIBLE;
					processedNodes.push(parentNode._id);
				}
			} else {
				nodes.push(parents[0]);
			}
		}
	}

	return {
		unhighlightedObjects,
		nodesSelectionMap,
		nodesVisibilityMap: pick(nodesVisibilityMap, processedNodes)
	};
};

export const getSelectMeshesByNodes = (nodes = []) => {
	const treeNodesList = localData.nodesList;
	const nodesIndexesMap = localData.nodesIndexesMap;
	const idToMeshes = localData.meshesByModelId;

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

	return values(meshesByNodes) as any;
};

const handleUpdateVisibility = ({ nodesIds = [], ...extraData }) => {
	const { visibility } = extraData;
	const shouldBeInvisible = visibility === VISIBILITY_STATES.INVISIBLE;
	const result = {
		unhighlightedObjects: [],
		meshesToUpdate: [],
		nodesVisibilityMap: { ...extraData.nodesVisibilityMap },
		nodesSelectionMap: { ...extraData.nodesSelectionMap }
	};

	const nodes = getNodesByIds(nodesIds);
	if (shouldBeInvisible) {
		const selectedNodesIds = getSelectedNodesIds(extraData.nodesSelectionMap);
		const filteredNodesIds = intersection(nodesIds, selectedNodesIds);

		for (let index = 0; index < filteredNodesIds.length; index++) {
			const nodeId = filteredNodesIds[index];
			result.nodesSelectionMap[nodeId] = SELECTION_STATES.UNSELECTED;
		}
	}

	const {
		meshesToUpdate, nodesVisibilityMap,
		nodesSelectionMap, unhighlightedObjects
	} = handleNodesVisibility(nodes, { ...extraData, ...result });

	result.nodesSelectionMap = {
		...result.nodesSelectionMap,
		...nodesSelectionMap
	};

	result.nodesVisibilityMap = nodesVisibilityMap,
	result.meshesToUpdate = meshesToUpdate;
	result.unhighlightedObjects = [
		...unhighlightedObjects,
		...getSelectMeshesByNodes(nodes)
	];

	return result;
};

const handleNodesVisibility = (nodes, extraData) => {
	const { nodesVisibilityMap, ifcSpacesHidden, skipChildren, visibility, skipParents } = extraData;
	const { defaultVisibilityMap } = localData;

	const result = {
		unhighlightedObjects: [],
		meshesToUpdate: [],
		nodesVisibilityMap: {},
		nodesSelectionMap: {}
	};

	const parents = [];
	const processedNodes = [];

	for (let nodeLoopIndex = 0; nodeLoopIndex < nodes.length; nodeLoopIndex++) {
		const node = nodes[nodeLoopIndex];
		const nodeVisibility = nodesVisibilityMap[node._id];

		processedNodes.push(node._id);
		if (visibility === VISIBILITY_STATES.PARENT_OF_INVISIBLE || visibility !== nodeVisibility) {
			if (node.type === NODE_TYPES.MESH) {
				result.meshesToUpdate.push(node);
			}

			const children = node.hasChildren && !skipChildren ? getDeepChildren(node) : [];

			if (skipChildren && skipParents) {
				children.push(node);
			}

			for (let index = 0; index < children.length; index++) {
				const child = children[index];
				processedNodes.push(child._id);

				if (nodeVisibility !== visibility && child.type === NODE_TYPES.MESH) {
					result.meshesToUpdate.push(child);
				}

				if (visibility === VISIBILITY_STATES.VISIBLE) {
					if (!(ifcSpacesHidden && defaultVisibilityMap[child._id] === VISIBILITY_STATES.INVISIBLE)) {
						result.nodesVisibilityMap[child._id] = VISIBILITY_STATES.VISIBLE;
					}
				} else {
					result.nodesSelectionMap[child._id] = SELECTION_STATES.UNSELECTED;
					result.nodesVisibilityMap[child._id] = VISIBILITY_STATES.INVISIBLE;
				}
			}

			if (!skipParents) {
				parents.push(node);
			}
		}
	}

	if (!skipParents) {
		const parentsResult = updateParentsVisibility(parents, {
			...extraData,
			nodesVisibilityMap: {
				...extraData.nodesVisibilityMap,
				...result.nodesVisibilityMap
			}
		});

		return {
			meshesToUpdate: result.meshesToUpdate,
			nodesVisibilityMap: {
				...pick(result.nodesVisibilityMap, processedNodes),
				...parentsResult.nodesVisibilityMap
			},
			nodesSelectionMap: {
				...pick(result.nodesSelectionMap, processedNodes),
				...parentsResult.nodesSelectionMap
			},
			unhighlightedObjects: parentsResult.unhighlightedObjects
		};
	}

	return result;
};

const handleToSelect = (toSelect, extraData) => {
	const { nodesVisibilityMap } = extraData;

	const newNodesSelectionMap = {};
	for (let index = 0; index < toSelect.length; index++) {
		const node = toSelect[index];
		const currentVisibility = nodesVisibilityMap[node._id];

		if (currentVisibility !== VISIBILITY_STATES.INVISIBLE) {
			if (currentVisibility === VISIBILITY_STATES.PARENT_OF_INVISIBLE) {
				newNodesSelectionMap[node._id] = SELECTION_STATES.UNSELECTED;
			} else {
				newNodesSelectionMap[node._id] = SELECTION_STATES.SELECTED;
			}
		}
	}

	return newNodesSelectionMap;
};

const handleDeselectNodes = ({ nodesIds = [], ...extraData }) => {
	const { selectedNodesIds } = extraData;
	const filteredNodesIds = intersection(nodesIds, selectedNodesIds);
	const nodes = getNodesByIds(filteredNodesIds);
	const nodesSelectionMap = {};

	for (let index = 0; index < filteredNodesIds.length; index++) {
		nodesSelectionMap[filteredNodesIds[index]] = SELECTION_STATES.UNSELECTED;
	}

	const unhighlightedObjects = getSelectMeshesByNodes(nodes);
	return { nodesSelectionMap, unhighlightedObjects };
};

const handleSelectNodes = ({ nodes = [], ...extraData }) => {
	const { skipChildren } = extraData;
	const result = {
		highlightedObjects: [],
		nodesSelectionMap: {}
	};

	if (!skipChildren) {
		const children = nodes.map((node) => getDeepChildren(node)) as any;
		nodes = [...nodes, ...children.flat()];
	}

	const nodesSelectionMap = handleToSelect(nodes, extraData);
	result.nodesSelectionMap = {
		...result.nodesSelectionMap,
		...nodesSelectionMap
	};

	result.highlightedObjects = getSelectMeshesByNodes(nodes);
	return result;
};

const handleIsolateNodes = ({ nodesIds = [], ...extraData }: any) => {
	const { nodesSelectionMap, nodesVisibilityMap } = extraData;
	const { nodesList } = localData;
	const toUnhighlight = [];
	const toHighlight = [];
	const meshesToUpdate = [];

	for (let index = 0; index < nodesList.length; index++) {
		const node = nodesList[index];
		const shouldBeVisible = nodesIds.includes(node._id);
		if (shouldBeVisible) {
			nodesSelectionMap[node._id] = SELECTION_STATES.SELECTED;
			nodesVisibilityMap[node._id] = VISIBILITY_STATES.VISIBLE;
			toHighlight.push(node);
			if (node.type === NODE_TYPES.MESH) {
				meshesToUpdate.push(node);
			}
		} else if (nodesVisibilityMap[node._id] !== VISIBILITY_STATES.INVISIBLE) {
			toUnhighlight.push(node);
			nodesVisibilityMap[node._id] = VISIBILITY_STATES.INVISIBLE;
			nodesSelectionMap[node._id] = SELECTION_STATES.UNSELECTED;
			if (node.type === NODE_TYPES.MESH) {
				meshesToUpdate.push(node);
			}
		}
	}

	const unhighlightedObjects = getSelectMeshesByNodes(toUnhighlight);
	const highlightedObjects = getSelectMeshesByNodes(toHighlight);

	return {
		nodesSelectionMap,
		nodesVisibilityMap,
		unhighlightedObjects,
		highlightedObjects,
		meshesToUpdate
	};
};

self.addEventListener('message', ({ data }) => {
	const { actionId, type, ...payload } = data;
	let result;
	let error: string;

	// tslint:disable-next-line
	IS_DEVELOPMENT && console.time(`TREE ACTION (${actionId})`);
	try {
		switch (type) {
			case ACTION_TYPES.SET_DATA:
				setLocalData(payload);
				break;
			case ACTION_TYPES.SELECT_NODES:
				result = handleSelectNodes(payload);
				break;
			case ACTION_TYPES.DESELECT_NODES:
				result = handleDeselectNodes(payload);
				break;
			case ACTION_TYPES.UPDATE_VISIBILITY:
				result = handleUpdateVisibility(payload);
				break;
			case ACTION_TYPES.ISOLATE_NODES:
				result = handleIsolateNodes(payload);
				break;
			default:
				error = 'Undefined action type';
		}
	} catch (e) {
		error = e.message;
	}
	// tslint:disable-next-line
	IS_DEVELOPMENT && console.timeEnd(`TREE ACTION (${actionId})`);

	// @ts-ignore
	self.postMessage(JSON.stringify({ actionId, result, error }));
}, false);
