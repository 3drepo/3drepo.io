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
import CloudDownload from '@material-ui/icons/CloudDownload';
import CloudUpload from '@material-ui/icons/CloudUpload';
import Delete from '@material-ui/icons/Delete';
import Edit from '@material-ui/icons/Edit';
import People from '@material-ui/icons/People';
import Settings from '@material-ui/icons/Settings';
import Share from '@material-ui/icons/Share';
import SettingsBackupRestore from '@material-ui/icons/SettingsBackupRestore';

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
		color: 'error',
		requiredPermissions: 'delete_model'
	},
	ADD_NEW: {
		label: 'Add new item',
		Icon: AddCircle
	},
	EDIT: {
		label: 'Edit',
		Icon: Edit,
		requiredPermissions: 'edit_federation'
	}
};

export const MODEL_TYPE = 'model';
export const FEDERATION_TYPE = 'federation';

export const MODEL_SUBTYPES = [
	{ value: 'Architectural' },
	{ value: 'GIS' },
	{ value: 'Mechanical' },
	{ value: 'Structural' },
	{ value: 'Other' }
];

export const LIST_ITEMS_TYPES = {
	TEAMSPACE: 'TEAMSPACE',
	MODEL: 'MODEL',
	FEDERATION: 'FEDERATION',
	PROJECT: 'PROJECT',
};
