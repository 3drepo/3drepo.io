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

import Download from '@material-ui/icons/CloudDownload';
import Upload from '@material-ui/icons/CloudUpload';
import Delete from '@material-ui/icons/Delete';
import InvertColors from '@material-ui/icons/InvertColors';
import OfflineBolt from '@material-ui/icons/OfflineBolt';
import PanTool from '@material-ui/icons/PanTool';

import { capitalize } from 'lodash';

import { COLOR } from '../styles';

export const GROUP_PANEL_NAME = 'group';

export const GROUPS_TYPES = {
	NORMAL: 'normal',
	SMART: 'smart'
};

export const GROUPS_TYPES_LIST = [{
	label: capitalize(GROUPS_TYPES.SMART),
	type: GROUPS_TYPES.SMART
}, {
	label: capitalize(GROUPS_TYPES.NORMAL),
	type: GROUPS_TYPES.NORMAL
}];

export const GROUP_TYPES_ICONS = {
	[GROUPS_TYPES.NORMAL]: PanTool,
	[GROUPS_TYPES.SMART]: OfflineBolt
};

export const GROUPS_ACTIONS_ITEMS = {
	NORMAL_GROUPS: 'show standard groups',
	SMART_GROUPS: 'show smart groups',
	EXPORT: 'export groups',
	IMPORT: 'import groups',
	OVERRIDE_ALL: 'overrideAll',
	DOWNLOAD: 'download',
	DELETE_ALL: 'deleteAll'
};

export const GROUPS_ACTIONS_MENU = [
	{
		name: GROUPS_ACTIONS_ITEMS.SHOW_STANDARD,
		label: 'Show Standard Groups',
		Icon: PanTool
	},
	{
		name: GROUPS_ACTIONS_ITEMS.SHOW_SMART,
		label: 'Show Smart Groups',
		Icon: OfflineBolt
	},
	{
		name: GROUPS_ACTIONS_ITEMS.EXPORT,
		label: 'Export Groups',
		Icon: Download
	},
	{
		name: GROUPS_ACTIONS_ITEMS.Import,
		label: 'Import Groups',
		Icon: Upload
	},
	{
		name: GROUPS_ACTIONS_ITEMS.OVERRIDE_ALL,
		label: 'Override All',
		Icon: InvertColors
	},
	{
		name: GROUPS_ACTIONS_ITEMS.DELETE_ALL,
		label: 'Delete All',
		Icon: Delete
	},
	{
		name: GROUPS_ACTIONS_ITEMS.DOWNLOAD,
		label: 'Download JSON',
		Icon: Download
	}
];

export const DEFAULT_OVERRIDE_COLOR = COLOR.BLACK_54;
