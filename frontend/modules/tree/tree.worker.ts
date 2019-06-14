import { omit, flattenDeep, sumBy } from 'lodash';

interface IRow {
	_id: string;
	name: string;
	level: number;
	parentId: number;
	hasChildren: boolean;
	childrenNumber: number;
	data: any;
	isFederation: boolean;
}

const getFlattenNested = (tree, level = 1, parentId = null) => {
	const rowData: IRow = {
		_id: tree._id,
		isFederation: tree.isFederation,
		name: tree.name,
		level,
		parentId,
		hasChildren: Boolean(tree.children),
		childrenNumber: 0,
		data: omit(tree, ['children'])
	};

	const dataToFlatten = [] as any;

	if (tree.children) {
		for (let index = 0; index < tree.children.length; index++) {
			const subTree = tree.children[index];

			const { data: nestedData, childrenNumber } = getFlattenNested(subTree, level + 1, tree._id);
			rowData.childrenNumber += childrenNumber;
			dataToFlatten.push(nestedData);
		}
	}

	dataToFlatten.unshift(rowData);

	const data = flattenDeep(dataToFlatten);
	return { data, childrenNumber: data.length };
};

self.addEventListener('message', ({ data }) => {
	const { mainTree, subTrees, subModels } = data;

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
	const nodesIndexesMap = nodesList.reduce((indiecesMap, node: IRow, index) => {
		indiecesMap[node._id] = index;
		return indiecesMap;
	}, {});
	const result = { data: { nodesList, nodesIndexesMap }};
	console.timeEnd('TREE PROCESSING');

	// @ts-ignore
	self.postMessage(JSON.stringify({ result }));
}, false);
