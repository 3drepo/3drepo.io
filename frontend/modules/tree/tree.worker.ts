import { omit, flattenDeep, sumBy } from 'lodash';

interface IRow {
	_id: string;
	name: string;
	level: number;
	parentIndex: number;
	parentId: number;
	hasChildren: boolean;
	childrenNumber: number;
	data: any;
	isFederation: boolean;
}

const getFlattenNested = (tree, level = 1, currentIndex = 0, parentIndex = null, parentId = null) => {
	const rowData: IRow = {
		_id: tree._id,
		isFederation: tree.isFederation,
		name: tree.name,
		level,
		parentIndex,
		parentId,
		hasChildren: Boolean(tree.children),
		childrenNumber: 0,
		data: omit(tree, ['children'])
	};

	const dataToFlatten = [] as any;
	let dataMap = {};

	if (tree.children) {
		for (let index = 0; index < tree.children.length; index++) {
			const subTree = tree.children[index];
			const prevSubTreeChildren = index > 0 ? (tree.children[index - 1].children || []) : [] ;
			const childIndex = index + prevSubTreeChildren.length;

			const flattenNestedData = getFlattenNested(subTree, level + 1, childIndex, currentIndex, tree._id);
			rowData.childrenNumber += flattenNestedData.childrenNumber;
			dataToFlatten.push(flattenNestedData.data);
			dataMap = {
				[rowData._id]: currentIndex,
				...flattenNestedData.map
			};
		}
	}

	dataToFlatten.unshift(rowData);

	const data = flattenDeep(dataToFlatten);
	const childrenNumber = data.length;

	return { data, map: dataMap, childrenNumber };
};

self.addEventListener('message', ({ data }) => {
	const { mainTree, subTrees, subModels } = data;

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

	console.time('TREE PROCESSING');
	const { data: nodesList, map: nodesIndexesMap } = getFlattenNested(mainTree);
	const result = {
		data: { nodesList, nodesIndexesMap }
	};
	console.timeEnd('TREE PROCESSING');
 self.postMessage(JSON.stringify({ result }));
}, false);
