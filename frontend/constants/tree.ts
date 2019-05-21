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

export const TREE_ITEM_SIZE = 40;

export const TREE_ITEM_FEDERATION_TYPE = 'FEDERATION';
export const TREE_ITEM_MODEL_TYPE = 'MODEL';
export const TREE_ITEM_OBJECT_TYPE = 'OBJECT';

export const VISIBILITY_STATES = {
	VISIBLE: 'VISIBLE',
	INVISIBLE: 'INVISIBLE',
	PARENT_OF_INVISIBLE: 'PARENT_OF_INVISIBLE'
};

export const BACKEND_VISIBILITY_STATES = {
	visible: 'VISIBLE',
	invisible: 'INVISIBLE',
	parentOfInvisible: 'PARENT_OF_INVISIBLE'
};

export const SELECTION_STATES = {
	SELECTED: 'SELECTED',
	UNSELECTED: 'UNSELECTED',
	PARENT_OF_UNSELECTED: 'PARENT_OF_UNSELECTED'
};

export const NODE_TYPES = {
	MESH: 'mesh',
	TRANSFORMATION: 'transformation'
};
