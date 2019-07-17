import { VISIBILITY_STATES, SELECTION_STATES, BACKEND_VISIBILITY_STATES } from '../../../constants/tree';
import { IS_DEVELOPMENT } from '../../../constants/environment';
import { INode } from './treeProcessing.constants';

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
	meta: node.meta || [],
	model: node.model || node.project,
	shared_ids: node.shared_id ? [node.shared_id] : node.shared_ids,
	defaultVisibility: BACKEND_VISIBILITY_STATES[node.toggleState]
});

const getFlattenNested = (tree, level = 1, parentId = null, rootParentId = null) => {
	const rowData: INode = {
		...getTransformedNodeData(tree),
		namespacedId: getNamespacedId(tree),
		isFederation: tree.isFederation,
		isModel: tree.isModel || isModelNode(level, tree.isFederation),
		level,
		parentId,
		rootParentId,
		hasChildren: Boolean(tree.children),
		deepChildrenNumber: 0,
		childrenIds: []
	};

	const dataToFlatten = [] as any;

	if (tree.children) {
		rootParentId = rowData.isModel ? rowData._id : rootParentId;

		for (let index = 0; index < tree.children.length; index++) {
			const subTree = tree.children[index];
			subTree.isModel = isModelNode(level + 1, subTree.isFederation, tree.isFederation);

			const { data: nestedData, deepChildrenNumber } = getFlattenNested(subTree, level + 1, tree._id, rootParentId);
			rowData.deepChildrenNumber += deepChildrenNumber;
			rowData.childrenIds.push(subTree._id);
			dataToFlatten.push(nestedData);

			const someOfNestedIsInvisible = nestedData.some((node: INode) => {
				return node.defaultVisibility !== VISIBILITY_STATES.VISIBLE;
			});

			if (someOfNestedIsInvisible) {
				rowData.defaultVisibility = VISIBILITY_STATES.PARENT_OF_INVISIBLE;
			}
		}
	}

	dataToFlatten.unshift(rowData);

	const data = dataToFlatten.flat();
	return { data, deepChildrenNumber: data.length };
};

const getAuxiliaryMaps = (nodesList) => {
	const initialState = {
		nodesIndexesMap: {},
		nodesVisibilityMap: {},
		nodesSelectionMap: {},
		nodesBySharedIdsMap: {},
		nodesDefaultVisibilityMap: {}
	} as any;

	return nodesList.reduce((maps, node: INode, index) => {
		maps.nodesIndexesMap[node._id] = index;
		maps.nodesVisibilityMap[node._id] = node.defaultVisibility || VISIBILITY_STATES.VISIBLE;
		maps.nodesDefaultVisibilityMap[node._id] = node.defaultVisibility;
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

export default ({ mainTree, subTrees, subModels, modelsWithMeshes }) => new Promise((resolve, reject) => {
	try {
		// tslint:disable-next-line
		IS_DEVELOPMENT && console.time('TREE PRE-PROCESSING NEW');
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
		// tslint:disable-next-line
		IS_DEVELOPMENT && console.timeEnd('TREE PRE-PROCESSING NEW');

		// tslint:disable-next-line
		IS_DEVELOPMENT && console.time('TREE PROCESSING NEW');
		const { data: nodesList } = getFlattenNested(mainTree);
		const meshesByModelId = getMeshesByModelId(modelsWithMeshes);
		const auxiliaryMaps = getAuxiliaryMaps(nodesList);
		// tslint:disable-next-line
		IS_DEVELOPMENT && console.timeEnd('TREE PROCESSING NEW');
		resolve({ nodesList, meshesByModelId, ...auxiliaryMaps });
	} catch (error) {
		reject(error);
	}
});
