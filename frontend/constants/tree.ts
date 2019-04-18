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

const mockedTreeFlatList = [
	{
		_id: "eb467231-7806-4546-bd42-4e5a330761e4", // FEDERATION
		level: 1,
		parentIndex: null,
		parentId: null,
		data: {
			name: ""
		}
	},
	{
		_id: "eb467231-7806-4546-bd42-4e5a330761e4", // SUBMODEL 1
		level: 2,
		parentIndex: 0,
		parentId: "eb467231-7806-4546-bd42-4e5a330761e4",
		data: {
				// data that node already have, without children
		}
	},
	{
		_id: "3d249196-92b8-403d-a463-b4f6cfa52dd3", // SUBMODEL's 1 CHILD
		level: 3,
		parentIndex: 1,
		parentId: "eb467231-7806-4546-bd42-4e5a330761e4",
		data: {
				// data that node already have, without children
		}
	},
	{
		_id: "0849c580-b515-46fa-a6dd-3c5dea0e2d4a", // SUBMODEL 2
		level: 2,
		parentIndex: 0,
		parentId: "eb467231-7806-4546-bd42-4e5a330761e4",
		data: {
				// data that node already have, without children
		}
	},
	{
		_id: "898cf64b-64a3-4173-a530-ab6600df5558", // SUBMODEL 3
		level: 2,
		parentIndex: 0,
		parentId: "eb467231-7806-4546-bd42-4e5a330761e4",
		data: {
				// data that node already have, without children
		}
	}
];
