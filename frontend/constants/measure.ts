import DeleteIcon from '@material-ui/icons/Delete';
import EdgeSnappingIcon from '@material-ui/icons/PermDataSetting';
import ResetIcon from '@material-ui/icons/RotateLeft';
import UnitsIcon from '@material-ui/icons/Straighten';
import ShowXYZIcon from '@material-ui/icons/Toc';

export const MEASURE_ACTIONS_ITEMS = {
	EDGE_SNAPPING: 'edgeSnapping',
	SHOW_XYZ: 'showXYZ',
	UNITS_DISPLAYED_IN: 'unitsDisplayedIn',
	RESET_COLOURS: 'resetColours',
	DELETE_ALL: 'deleteAll'
};

export const MEASURE_ACTIONS_MENU = [
	{
		name: MEASURE_ACTIONS_ITEMS.EDGE_SNAPPING,
		label: 'Edge Snapping',
		Icon: EdgeSnappingIcon
	},
	{
		name: MEASURE_ACTIONS_ITEMS.SHOW_XYZ,
		label: 'Show XYZ',
		Icon: ShowXYZIcon
	},
	{
		name: MEASURE_ACTIONS_ITEMS.UNITS_DISPLAYED_IN,
		label: 'Units displayed in',
		Icon: UnitsIcon
	},
	{
		name: MEASURE_ACTIONS_ITEMS.RESET_COLOURS,
		label: 'Reset Colours',
		Icon: ResetIcon
	},
	{
		name: MEASURE_ACTIONS_ITEMS.DELETE_ALL,
		label: 'Delete All',
		Icon: DeleteIcon
	}
];
