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

const { getTeamspaceAdmins, hasAccessToTeamspace } = require('../../models/teamspaces');
const { PROJECT_ADMIN } = require('./permissions.constants');
const { getModelById } = require('../../models/modelSettings');
const { getProjectAdmins } = require('../../models/projects');

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

const hasAdminPermissions = async (teamspace, project, username) =>{
	const isAdminArr = (await Promise.all([
		Permissions.isTeamspaceAdmin(teamspace, username),
		Permissions.isProjectAdmin(teamspace, project, username),
	]));

	return isAdminArr.filter((bool) => bool).length;
}

Permissions.hasWriteAccessToModel = async (teamspace, project, model, username, adminCheck = true) => {
	if (adminCheck) {
		const hasAdminPerms = await hasAdminPermissions(teamspace, project, username);
		if(hasAdminPerms){
			return true;
		}		
	}

	const { permissions } = await getModelById(teamspace, model, { permissions: 1 });
	return permissions && permissions.some((perm) => perm.user === username && perm.permission === 'collaborator' );
};

Permissions.hasReadAccessToModel = async (teamspace, project, model, username, adminCheck = true) => {
	if (adminCheck) {
		const hasAdminPerms = await hasAdminPermissions(teamspace, project, username);
		if(hasAdminPerms){
			return true;
		}		
	}

	const { permissions } = await getModelById(teamspace, model, { permissions: 1 });
	// we assume the user has access if they have some form of permissions on the model
	return permissions && permissions.some((perm) => perm.user === username);
};

module.exports = Permissions;
