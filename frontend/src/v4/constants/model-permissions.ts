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

export const MODEL_ROLES_TYPES = {
	ADMINISTRATOR: 'admin',
	COLLABORATOR: 'collaborator',
	COMMENTER: 'commenter',
	VIEWER: 'viewer',
	UNASSIGNED: '',
	NONE: 'none'
};

export const MODEL_ROLES_DESC = {
	UNASSIGNED: 'No access',
	VIEWER: 'Can only view',
	COMMENTER: 'View and create issues',
	COLLABORATOR: 'Full access and ability to upload/download revisions',
	ADMINISTRATOR: 'Collaborator access and edit permissions'
};

export const MODEL_ROLES_LIST = [
	{
		key: MODEL_ROLES_TYPES.UNASSIGNED,
		label: 'Unassigned',
		tooltip: MODEL_ROLES_DESC.UNASSIGNED
	},
	{
		key: MODEL_ROLES_TYPES.VIEWER,
		label: 'Viewer',
		tooltip: MODEL_ROLES_DESC.VIEWER
	},
	{
		key: MODEL_ROLES_TYPES.COMMENTER,
		label: 'Commenter',
		tooltip: MODEL_ROLES_DESC.COMMENTER
	},
	{
		key: MODEL_ROLES_TYPES.COLLABORATOR,
		label: 'Collaborator',
		tooltip: MODEL_ROLES_DESC.COLLABORATOR
	},
	{
		key: MODEL_ROLES_TYPES.ADMINISTRATOR,
		label: 'Admin',
		tooltip: MODEL_ROLES_DESC.ADMINISTRATOR
	}
];

export const getModelPermissionLabelFromType = (type) => MODEL_ROLES_LIST.find(({ key }) => key === type).label;