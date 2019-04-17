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
