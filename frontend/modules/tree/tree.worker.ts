import { omit, flattenDeep } from 'lodash';

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
		childrenNumber: tree.children ? tree.children.length : 0,
		data: omit(tree, ['children'])
	};

	const dataToFlatten = [] as any;

	if (tree.children) {
		for (let index = 0; index < tree.children.length; index++) {
			const subTree = tree.children[index];
			const prevSubTreeChildren = index > 0 ? (tree.children[index - 1].children || []) : [] ;
			const childIndex = index + prevSubTreeChildren.length;
			const subTreeData = getFlattenNested(subTree, level + 1, childIndex, currentIndex, tree._id);
			rowData.childrenNumber += subTreeData.length;
			dataToFlatten.push(subTreeData);
		}
	}

	dataToFlatten.unshift(rowData);

	return flattenDeep(dataToFlatten);
};

self.addEventListener('message', ({ data }) => {
	const { mainTree } = data;
	console.time('TREE PROCESSING');
	const nodesList = getFlattenNested(mainTree);
	const result = { data: nodesList };
	console.timeEnd('TREE PROCESSING');
  self.postMessage(JSON.stringify({ result }));
}, false);
