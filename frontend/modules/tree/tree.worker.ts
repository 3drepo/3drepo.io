import { omit, flattenDeep } from 'lodash';
import { VISIBILITY_STATES, SELECTION_STATES } from '../../constants/tree';

interface INode {
	_id: string;
	name: string;
	level: number;
	parentId: number;
	hasChildren: boolean;
	childrenNumber: number;
	data: any;
	isFederation?: boolean;
	isModel?: boolean;
	shared_ids?: string[];
}

const isModelNode = (level, isFederation, hasFederationAsParent?) => {
	return (level === 1 && !isFederation) || (level === 2 && hasFederationAsParent);
};

const getFlattenNested = (tree, level = 1, parentId = null) => {
	const rowData: INode = {
		_id: tree._id,
		isFederation: tree.isFederation,
		isModel: tree.isModel || isModelNode(level, tree.isFederation),
		name: tree.name,
		level,
		parentId,
		hasChildren: Boolean(tree.children),
		childrenNumber: 0,
		data: {
			...omit(tree, ['children']),
			shared_ids: tree.shared_id ? [tree.shared_id] : tree.shared_ids
		}
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

		for (let sharedIndex = 0; sharedIndex < node.data.shared_ids.length; sharedIndex++) {
			const sharedId = node.data.shared_ids[sharedIndex];
			maps.nodesBySharedIdsMap[sharedId] = node._id;
		}

		return maps;
	}, initialState);
};

const getMeshesByModelId = (modelsWithMeshes) => {
	const meshesByModelId = {};
	for (let index = 0; index < modelsWithMeshes.length; index++) {
		const modelWithMeshes = modelsWithMeshes[index];
		const { account: teamspace, model: modelId } = modelWithMeshes;
		delete modelWithMeshes.account;
		delete modelWithMeshes.model;
		meshesByModelId[`${teamspace}@${modelId}`] = modelWithMeshes;
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
