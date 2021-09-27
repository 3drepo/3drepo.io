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

const {
	MODEL_COMMENT_ROLES,
	MODEL_READ_ROLES,
	MODEL_WRITE_ROLES,
	PROJECT_ADMIN,
} = require('./permissions.constants');
const { getProjectAdmins, modelExistsInProject } = require('../../models/projects');
const { getTeamspaceAdmins, hasAccessToTeamspace } = require('../../models/teamspaces');
const { getModelById } = require('../../models/modelSettings');

const Permissions = {};

Permissions.isTeamspaceAdmin = async (teamspace, username) => {
	const admins = await getTeamspaceAdmins(teamspace);
	return admins.includes(username);
};

Permissions.hasAccessToTeamspace = hasAccessToTeamspace;

Permissions.isProjectAdmin = async (teamspace, project, username) => {
	const admins = await getProjectAdmins(teamspace, project);
	return admins.includes(username);
};

Permissions.hasProjectAdminPermissions = (perms, username) => perms.some(
	({ user, permissions }) => user === username && permissions.includes(PROJECT_ADMIN),
);

const hasAdminPermissions = async (teamspace, project, username) => {
	const isAdminArr = (await Promise.all([
		Permissions.isTeamspaceAdmin(teamspace, username),
		Permissions.isProjectAdmin(teamspace, project, username),
	]));

	return isAdminArr.filter((bool) => bool).length;
};

const modelPermCheck = (permCheck) => async (teamspace, project, modelID, username, adminCheck = true) => {
	const model = await getModelById(teamspace, modelID, { permissions: 1 });

	const modelExists = await modelExistsInProject(teamspace, project, modelID);
	if (!modelExists) {
		return false;
	}

	if (adminCheck) {
		const hasAdminPerms = await hasAdminPermissions(teamspace, project, username);
		if (hasAdminPerms) {
			return true;
		}
	}

	const { permissions } = model;
	return permissions && permissions.some((perm) => perm.user === username && permCheck(perm));
};

Permissions.hasWriteAccessToModel = modelPermCheck((perm) => MODEL_WRITE_ROLES.includes(perm.permission));

Permissions.hasCommenterAccessToModel = modelPermCheck((perm) => MODEL_COMMENT_ROLES.includes(perm.permission));

Permissions.hasReadAccessToModel = modelPermCheck((perm) => MODEL_READ_ROLES.includes(perm.permission));

module.exports = Permissions;
