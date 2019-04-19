import ShowAllIcon from '@material-ui/icons/Visibility';
import IsolateIcon from '@material-ui/icons/VisibilityOutlined';
import IFCSpacesIcon from '@material-ui/icons/ViewAgenda';

export const TREE_ACTIONS_ITEMS = {
	SHOW_ALL: 'showAll',
	ISOLATE_SELECTED: 'isolateSelected',
	HIDE_IFC_SPACES: 'hideIfcSpaces'
};

export const TREE_ACTIONS_MENU = [
	{
		name: TREE_ACTIONS_ITEMS.SHOW_ALL,
		label: 'Show All',
		Icon: ShowAllIcon
	},
	{
		name: TREE_ACTIONS_ITEMS.ISOLATE_SELECTED,
		label: 'Isolate Selected',
		Icon: IsolateIcon
	},
	{
		name: TREE_ACTIONS_ITEMS.HIDE_IFC_SPACES,
		label: 'Hide IFC spaces',
		Icon: IFCSpacesIcon
	}
];

export const TREE_ITEM_FEDERATION_TYPE = 'FEDERATION';
export const TREE_ITEM_MODEL_TYPE = 'MODEL';
export const TREE_ITEM_OBJECT_TYPE = 'OBJECT';

const TREE_ITEMS_TYPES = {
	[TREE_ITEM_FEDERATION_TYPE]: TREE_ITEM_FEDERATION_TYPE,
	[TREE_ITEM_MODEL_TYPE]: TREE_ITEM_MODEL_TYPE,
	[TREE_ITEM_OBJECT_TYPE]: TREE_ITEM_OBJECT_TYPE
};

export const mockedTreeFlatList = [
	{
		_id: "fghjk-ertyui-cvbnm", // FEDERATION
		index: 0,
		level: 1,
		parentIndex: null,
		parentId: null,
		name: 'Federation name',
		isFederation: true
	},
	{
		_id: "asdfgh-xcvbnm-rtyuo", // SUBMODEL 1
		index: 1,
		level: 2,
		parentIndex: 0,
		parentId: "fghjk-ertyui-cvbnm",
		name: 'Model A - Revision AA',
		hasChildren: true,
		childrenNumber: 13
	},
	{
		_id: "cvbnm-dfghjk-qwerty",
		index: 2,
		level: 3,
		parentIndex: 1,
		parentId: "asdfgh-xcvbnm-rtyuo",
		name: 'Object name',
		hasChildren: true,
		childrenNumber: 3
	},
	{
		_id: "iuytr-mnhgfc-rthbvcd",
		index: 3,
		level: 4,
		parentIndex: 2,
		parentId: "cvbnm-dfghjk-qwerty",
		name: 'Object some name',
		hasChildren: true,
		childrenNumber: 0
	},
	{
		_id: "xerfs-kjhgfd-rtyuhg",
		index: 4,
		level: 4,
		parentIndex: 2,
		parentId: "cvbnm-dfghjk-qwerty",
		name: 'Object name 3drepos parent',
		hasChildren: true,
		childrenNumber: 4
	},
	{
		_id: "edcfg-iuytr-zxcvbh",
		index: 5,
		level: 5,
		parentIndex: 4,
		parentId: "xerfs-kjhgfd-rtyuhg",
		name: 'Object name 3drepo'
	},
	{
		_id: "lkjhg-asdfgh-edcfty",
		index: 6,
		level: 5,
		parentIndex: 4,
		parentId: "xerfs-kjhgfd-rtyuhg",
		name: 'Object name 4drepo',
	},
	{
		_id: "mnbv-lkjhg-poiuyt",
		index: 7,
		level: 5,
		parentIndex: 4,
		parentId: "xerfs-kjhgfd-rtyuhg",
		name: 'Object name 5drepo'
	},
	{
		_id: "dfgfg-lkjhg-gfffh",
		index: 8,
		level: 5,
		parentIndex: 4,
		parentId: "xerfs-kjhgfd-rtyuhg",
		name: 'Object name 6drepo'
	},
	{
		_id: "ujgfe-zxcvb-kjhgf",
		index: 9,
		level: 4,
		parentIndex: 2,
		parentId: "cvbnm-dfghjk-qwerty",
		name: 'Object child 2',
		hasChildren: true,
		childrenNumber: 2
	},
	{
		_id: "hgdfh-asdfgh-edcfty",
		index: 10,
		level: 5,
		parentIndex: 9,
		parentId: "ujgfe-zxcvb-kjhgf",
		name: 'Object object',
		hasChildren: true
	},
	{
		_id: "mnbv-ityit-poiuyt",
		index: 11,
		level: 5,
		parentIndex: 9,
		parentId: "ujgfe-zxcvb-kjhgf",
		name: 'Object hello',
		hasChildren: true,
		childrenNumber: 3
	},
	{
		_id: "dfhdfh-asdfgh-edcfty",
		index: 12,
		level: 6,
		parentIndex: 11,
		parentId: "mnbv-ityit-poiuyt",
		name: 'Object lowest 1'
	},
	{
		_id: "mnbv-ityit-gdfg",
		index: 13,
		level: 6,
		parentIndex: 11,
		parentId: "mnbv-ityit-poiuyt",
		name: 'Object lowest 2'
	},
	{
		_id: "bnmgm-ityit-poiuy",
		index: 14,
		level: 6,
		parentIndex: 11,
		parentId: "mnbv-ityit-poiuyt",
		name: 'Object lowest 3'
	},
	{
		_id: "gdfgdfg-xcvbnm-rtyuo", // SUBMODEL 2
		index: 15,
		level: 2,
		parentIndex: 0,
		parentId: "fghjk-ertyui-cvbnm",
		name: 'Model B - Revision AA',
		hasChildren: false
	},
	{
		_id: "nfgnfn-xcvbnm-rtyuo", // SUBMODEL 3
		index: 16,
		level: 2,
		parentIndex: 0,
		parentId: "fghjk-ertyui-cvbnm",
		name: 'Model C - Revision BB',
		hasChildren: false
	}
];
