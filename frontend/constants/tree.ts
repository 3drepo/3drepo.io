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

import SelectAllIcon from '@material-ui/icons/DoneAll';
import GeometryIcon from '@material-ui/icons/ViewAgenda';
import ShowAllIcon from '@material-ui/icons/Visibility';
import IsolateIcon from '@material-ui/icons/VisibilityOutlined';

export const TREE_ACTIONS_ITEMS = {
	SHOW_ALL: 'showAll',
	ISOLATE_SELECTED: 'isolateSelected',
	SHOW_HIDDEN_GEOMETRY: 'showHiddenGeometry',
	SELECT_ALL: 'selectAll'
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
		name: TREE_ACTIONS_ITEMS.SHOW_HIDDEN_GEOMETRY,
		label: 'Show hidden geometry',
		Icon: GeometryIcon
	},
	{
		name: TREE_ACTIONS_ITEMS.SELECT_ALL,
		label: 'Select All',
		Icon: SelectAllIcon
	}
];

export const TREE_ITEM_SIZE = 40;
export const TREE_MAX_HEIGHT = 842;

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
