/**
 *  Copyright (C) 2021 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
