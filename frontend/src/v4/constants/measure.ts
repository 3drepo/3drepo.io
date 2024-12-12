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

import DeleteIcon from '@mui/icons-material/Delete';
import EdgeSnappingIcon from '@mui/icons-material/PermDataSetting';
import ResetIcon from '@mui/icons-material/RotateLeft';
import UnitsIcon from '@assets/icons/outlined/measure-outlined.svg';
import SlopeUnitsIcon from '@assets/icons/measurements/slope_units.svg';
import ShowXYZIcon from '@mui/icons-material/Toc';

export const MAX_SLOPE_IN_PERCENTAGE = 89.99 * Math.PI / 180;
export const DEGREES_SYMBOL = '°';
export const SLOPE_UNITS = {
	DEGREES: 'Degrees',
	PERCENTAGE: 'Percentage'
} as const;
export const slopeUnitsToSymbol = (slopeUnits) => slopeUnits === SLOPE_UNITS.DEGREES ? DEGREES_SYMBOL : '%';

export const MEASURE_ACTIONS_ITEMS = {
	EDGE_SNAPPING: 'edgeSnapping',
	SHOW_XYZ: 'showXYZ',
	UNITS_DISPLAYED_IN: 'unitsDisplayedIn',
	SLOPE_UNITS_DISPLAYED_IN: 'slopeUnitsDisplayedIn',
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
		name: MEASURE_ACTIONS_ITEMS.SLOPE_UNITS_DISPLAYED_IN,
		label: 'Slope units displayed in',
		Icon: SlopeUnitsIcon
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
