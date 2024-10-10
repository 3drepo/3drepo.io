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

export const PROJECT_ROLES_TYPES = {
	ADMINISTRATOR: 'admin_project',
	UNASSIGNED: ''
};

export const PROJECT_ROLES_DESC = {
	UNASSIGNED: 'No access',
	ADMINISTRATOR: 'Collaborator access and edit permissions'
};

export const PROJECT_ROLES_LIST = [
	{
		key: PROJECT_ROLES_TYPES.UNASSIGNED,
		label: 'Unassigned',
		width: '100px',
		tooltip: PROJECT_ROLES_DESC.UNASSIGNED
	},
	{
		key: PROJECT_ROLES_TYPES.ADMINISTRATOR,
		label: 'Admin',
		width: '100px',
		tooltip: PROJECT_ROLES_DESC.ADMINISTRATOR
	}
];

export const getProjectPermissionLabelFromType = (type) => PROJECT_ROLES_LIST.find(({ key }) => key === type).label;