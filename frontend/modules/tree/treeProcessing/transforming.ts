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

		for (let index = 0; index < mainTree.children.length; index++) {
			const child = mainTree.children[index];
			const [modelTeamspace, model] = (child.name || '').split(':');
			const subModel = subModels.find((m) => m.model === model);

			if (subModel) {
				subModelsRootNodes[child.name] = child._id;
				child.name = [modelTeamspace, subModel.name].join(':');
			} else if (child.type !== 'mesh') {
				child.name = child.name || DEFAULT_NODE_NAME;
			}

			if (subModel && child.children && child.children[0]) {
				child.children[0].name = subModel.name;
			}

			if (subTrees.length) {
				const subTree = subTrees.find(({ nodes }) => nodes.project === model);
				child.children[0].children = subTree ? [subTree.nodes] : [];
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
