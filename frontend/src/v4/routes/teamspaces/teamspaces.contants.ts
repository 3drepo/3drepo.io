/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import AddCircle from '@material-ui/icons/AddCircle';
import LoadModel from '@material-ui/icons/CameraEnhance';
import CloudDownload from '@material-ui/icons/CloudDownload';
import CloudUpload from '@material-ui/icons/CloudUpload';
import Delete from '@material-ui/icons/Delete';
import Edit from '@material-ui/icons/Edit';
import ExitToApp from '@material-ui/icons/ExitToApp';
import People from '@material-ui/icons/People';
import Settings from '@material-ui/icons/Settings';
import SettingsBackupRestore from '@material-ui/icons/SettingsBackupRestore';
import Share from '@material-ui/icons/Share';
import Board from '@material-ui/icons/TableChart';
import { DATA_TYPES, FILTER_TYPES } from '../components/filterPanel/filterPanel.component';
import { SortAmountDown, SortAmountUp } from '../components/fontAwesomeIcon';

export const ROW_ACTIONS = {
	UPLOAD_FILE: {
		label: 'Upload file',
		Icon: CloudUpload,
		requiredPermissions: 'upload_files'
	},
	REVISIONS: {
		label: 'Revisions',
		Icon: SettingsBackupRestore
	},
	DOWNLOAD: {
		label: 'Download',
		Icon: CloudDownload,
		requiredPermissions: 'download_model'
	},
	PERMISSIONS: {
		label: 'Permissions',
		Icon: People,
		requiredPermissions: 'manage_model_permission'
	},
	SHARE: {
		label: 'Share',
		Icon: Share,
	},
	SETTINGS: {
		label: 'Settings',
		Icon: Settings,
		requiredPermissions: 'change_model_settings'
	},
	DELETE: {
		label: 'Delete',
		Icon: Delete,
		requiredPermissions: 'delete_model'
	},
	ADD_NEW: {
		label: 'Add new item',
		Icon: AddCircle
	},
	LEAVE: {
		label: 'Leave teamspace',
		Icon: ExitToApp
	},
	EDIT: {
		label: 'Edit',
		Icon: Edit,
		requiredPermissions: 'edit_federation'
	},
	BOARD: {
		label: 'Issues & Risks',
		Icon: Board
	},
	LOAD_MODEL: {
		label: 'Load model with',
		Icon: LoadModel
	}
};

export const MODEL_TYPE = 'model';
export const FEDERATION_TYPE = 'federation';

export const MODEL_SUBTYPES = [
	{ value: 'Architectural' },
	{ value: 'Existing' },
	{ value: 'GIS' },
	{ value: 'Infrastructure' },
	{ value: 'Interior' },
	{ value: 'Landscape' },
	{ value: 'MEP' },
	{ value: 'Mechanical' },
	{ value: 'Structural' },
	{ value: 'Survey' },
	{ value: 'Other' }
];

export const TEAMSPACE_FILTER_RELATED_FIELDS = {
	DATA_TYPE: 'type',
	MODEL_TYPE: 'modelType',
	MODEL_CODE: 'code'
};

export const TEAMSPACES_FILTERS = [
	{
		label: 'By model type',
		relatedField: TEAMSPACE_FILTER_RELATED_FIELDS.MODEL_TYPE,
		type: FILTER_TYPES.UNDEFINED
	},
	{
		label: 'By model code',
		relatedField: TEAMSPACE_FILTER_RELATED_FIELDS.MODEL_CODE,
		type: FILTER_TYPES.UNDEFINED
	}
] as any;

export const LIST_ITEMS_TYPES = {
	TEAMSPACE: 'TEAMSPACE',
	MODEL: 'MODEL',
	FEDERATION: 'FEDERATION',
	PROJECT: 'PROJECT',
};

export const TEAMSPACES_DATA_TYPES = [
	{
		label: 'Models',
		type: DATA_TYPES.MODELS
	},
	{
		label: 'Federations',
		type: DATA_TYPES.FEDERATIONS
	},
	{
		label: 'Projects',
		type: DATA_TYPES.PROJECTS
	}
] as any;

export const SORTING_BY_NAME = 'name';
export const SORTING_BY_LAST_UPDATED = 'timestamp';

export const TEAMSPACES_PANEL_ACTIONS_MENU = [
	{
		label: 'Sort by name',
		sortingType: SORTING_BY_NAME,
		Icon: {
			ASC: SortAmountUp,
			DESC: SortAmountDown
		}
	},
	{
		label: 'Sort by last updated',
		sortingType: SORTING_BY_LAST_UPDATED,
		Icon: {
			ASC: SortAmountUp,
			DESC: SortAmountDown
		}
	},
];
