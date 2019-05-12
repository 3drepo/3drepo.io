import { flattenDeep } from 'lodash';
import { VISIBILITY_STATES, SELECTION_STATES } from '../../constants/tree';

interface INode {
	_id: string;
	namespacedId: string;
	name: string;
	level: number;
	parentId: number;
	hasChildren: boolean;
	childrenNumber: number;
	isFederation?: boolean;
	isModel?: boolean;
	shared_ids?: string[];
}

const isModelNode = (level, isFederation, hasFederationAsParent?) => {
	return (level === 1 && !isFederation) || (level === 2 && hasFederationAsParent);
};

const getNamespacedId = (node) => {
	const { account, model, project } = node;
	return `${account}@${model || project}`;
};

const getTransformedNodeData = (node) => ({
	_id: node._id,
	name: node.name,
	type: node.type,
	teamspace: node.account,
	model: node.model || node.project,
	shared_ids: node.shared_id ? [node.shared_id] : node.shared_ids,
});

const getFlattenNested = (tree, level = 1, parentId = null) => {
	const rowData: INode = {
		...getTransformedNodeData(tree),
		namespacedId: getNamespacedId(tree),
		isFederation: tree.isFederation,
		isModel: tree.isModel || isModelNode(level, tree.isFederation),
		level,
		parentId,
		hasChildren: Boolean(tree.children),
		childrenNumber: 0
	};

	const dataToFlatten = [] as any;

	if (tree.children) {
		for (let index = 0; index < tree.children.length; index++) {
			const subTree = tree.children[index];
			subTree.isModel = isModelNode(level + 1, subTree.isFederation, tree.isFederation);
			const { data: nestedData, childrenNumber } = getFlattenNested(subTree, level + 1, tree._id);
			rowData.childrenNumber += childrenNumber;
			dataToFlatten.push(nestedData);
		}
	}

	dataToFlatten.unshift(rowData);

	const data = flattenDeep(dataToFlatten);
	return { data, childrenNumber: data.length };
};

const getAuxiliaryMaps = (nodesList) => {
	const initialState = {
		nodesIndexesMap: {},
		nodesVisibilityMap: {},
		nodesSelectionMap: {},
		nodesBySharedIdsMap: {}
	} as any;

	return nodesList.reduce((maps, node: INode, index) => {
		maps.nodesIndexesMap[node._id] = index;
		maps.nodesVisibilityMap[node._id] = VISIBILITY_STATES.VISIBLE;
		maps.nodesSelectionMap[node._id] = SELECTION_STATES.UNSELECTED;

		for (let sharedIndex = 0; sharedIndex < node.shared_ids.length; sharedIndex++) {
			const sharedId = node.shared_ids[sharedIndex];
			maps.nodesBySharedIdsMap[sharedId] = node._id;
		}

		return maps;
	}, initialState);
};

const getMeshesByModelId = (modelsWithMeshes) => {
	const meshesByModelId = {};
	for (let index = 0; index < modelsWithMeshes.length; index++) {
		const modelWithMeshes = modelsWithMeshes[index];
		const { account, model: modelId } = modelWithMeshes;
		delete modelWithMeshes.account;
		delete modelWithMeshes.model;
		meshesByModelId[`${account}@${modelId}`] = modelWithMeshes;
	}
	return meshesByModelId;
};

self.addEventListener('message', ({ data }) => {
	const { mainTree, subTrees, subModels, modelsWithMeshes } = data;

	console.time('TREE PRE-PROCESSING');
	for (let index = 0; index < mainTree.children.length; index++) {
		const child = mainTree.children[index];
		const [modelTeamspace, model] = child.name.split(':');
		const subModel = subModels.find((m) => m.model === model);

		if (subModel) {
			child.name = [modelTeamspace, subModel.name].join(':');
		}

		if (subModel && child.children && child.children[0]) {
			child.children[0].name = subModel.name;
		}

		if (subTrees.length) {
			const subTree = subTrees.find(({ nodes }) => nodes.project === model);
			child.children[0].children = [subTree.nodes];
		}
	}
	console.timeEnd('TREE PRE-PROCESSING');

	console.time('TREE PROCESSING');
	const { data: nodesList } = getFlattenNested(mainTree);
	const meshesByModelId = getMeshesByModelId(modelsWithMeshes);
	const auxiliaryMaps = getAuxiliaryMaps(nodesList);
	const result = { data: { nodesList, meshesByModelId, ...auxiliaryMaps }};
	console.timeEnd('TREE PROCESSING');

	// @ts-ignore
	self.postMessage(JSON.stringify({ result }));
}, false);
