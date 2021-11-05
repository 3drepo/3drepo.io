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
const { getContainerById, getFederationById, getModelById } = require('../../models/modelSettings');
const { getProjectAdmins, modelExistsInProject } = require('../../models/projects');
const { getTeamspaceAdmins, hasAccessToTeamspace } = require('../../models/teamspaces');

const Permissions = {};

Permissions.isTeamspaceAdmin = async (teamspace, username) => {
	const admins = await getTeamspaceAdmins(teamspace);
	return admins.includes(username);
};

Permissions.isProjectAdmin = async (teamspace, project, username) => {
	const admins = await getProjectAdmins(teamspace, project);
	return admins.includes(username);
};

const hasAdminPermissions = async (teamspace, project, username) => {
	const isAdminArr = (await Promise.all([
		Permissions.isTeamspaceAdmin(teamspace, username),
		Permissions.isProjectAdmin(teamspace, project, username),
	]));

	return isAdminArr.filter((bool) => bool).length;
};

Permissions.hasAccessToTeamspace = hasAccessToTeamspace;

Permissions.hasProjectAdminPermissions = (perms, username) => perms.some(
	({ user, permissions }) => user === username && permissions.includes(PROJECT_ADMIN),
);

const modelType = {
	CONTAINERS: 0,
	FEDERATIONS: 1,
	ALL: 2,
};

const modelPermCheck = (permCheck, mode) => async (teamspace, project, modelID, username, adminCheck = true) => {
	let getModelFn = getModelById;

	if (mode === modelType.CONTAINERS) {
		getModelFn = getContainerById;
	} else if (mode === modelType.FEDERATIONS) {
		getModelFn = getFederationById;
	}

	const model = await getModelFn(teamspace, modelID, { permissions: 1 });

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

Permissions.hasWriteAccessToModel = modelPermCheck(
	(perm) => MODEL_WRITE_ROLES.includes(perm.permission), modelType.ALL,
);
Permissions.hasCommenterAccessToModel = modelPermCheck(
	(perm) => MODEL_COMMENT_ROLES.includes(perm.permission), modelType.ALL,
);
Permissions.hasReadAccessToModel = modelPermCheck(
	(perm) => MODEL_READ_ROLES.includes(perm.permission), modelType.ALL,
);

Permissions.hasAdminAccessToFederation = async (teamspace, project, federation, username) => {
	const [fed, federationExistsInProject, hasAdminPerms] = await Promise.all([
		getFederationById(teamspace, federation, { _id: 1 }),
		modelExistsInProject(teamspace, project, federation),
		hasAdminPermissions(teamspace, project, username),
	]);

	return fed && federationExistsInProject && hasAdminPerms > 0;
};
Permissions.hasWriteAccessToFederation = modelPermCheck(
	(perm) => MODEL_WRITE_ROLES.includes(perm.permission), modelType.FEDERATIONS,
);
Permissions.hasCommenterAccessToFederation = modelPermCheck(
	(perm) => MODEL_COMMENT_ROLES.includes(perm.permission), modelType.FEDERATIONS,
);
Permissions.hasReadAccessToFederation = modelPermCheck(
	(perm) => MODEL_READ_ROLES.includes(perm.permission), modelType.FEDERATIONS,
);

Permissions.hasAdminAccessToContainer = async (teamspace, project, container, username) => {
	const [con, containerExistsInProject, hasAdminPerms] = await Promise.all([
		getContainerById(teamspace, container, { _id: 1 }),
		modelExistsInProject(teamspace, project, container),
		hasAdminPermissions(teamspace, project, username),
	]);

	return con && containerExistsInProject && hasAdminPerms > 0;
};
Permissions.hasWriteAccessToContainer = modelPermCheck(
	(perm) => MODEL_WRITE_ROLES.includes(perm.permission), modelType.CONTAINERS,
);
Permissions.hasCommenterAccessToContainer = modelPermCheck(
	(perm) => MODEL_COMMENT_ROLES.includes(perm.permission), modelType.CONTAINERS,
);
Permissions.hasReadAccessToContainer = modelPermCheck(
	(perm) => MODEL_READ_ROLES.includes(perm.permission), modelType.CONTAINERS,
);

module.exports = Permissions;
