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

export const PERMISSIONS = {
	MANAGE_MODEL_PERMISSION: 'manage_model_permission',
	COMMENT_ISSUE: 'comment_issue',
	VIEW_ISSUE: 'view_issue'
};

export const hasPermissions = (requiredPerm = '', permissions = []) => {
	if (!requiredPerm) {
		return true;
	}
	return permissions.indexOf(requiredPerm) !== -1;
};

export const isAdmin = (permissions) => {
	return hasPermissions(PERMISSIONS.MANAGE_MODEL_PERMISSION, permissions);
};

export const isViewer = (permissions) => {
	return permissions && !hasPermissions(PERMISSIONS.COMMENT_ISSUE, permissions);
};
