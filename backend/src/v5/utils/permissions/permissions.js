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
const { findModels, getContainerById, getDrawingById, getFederationById, getModelById } = require('../../models/modelSettings');
const { getProjectAdmins, modelsExistInProject } = require('../../models/projectSettings');
const { getTeamspaceAdmins, hasAccessToTeamspace } = require('../../models/teamspaceSettings');
const { modelTypes } = require('../../models/modelSettings.constants');

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

const modelPermCheck = (permCheck, modelType) => async (teamspace, project, modelID, username, adminCheck = true) => {
	let getModelFn = getModelById;

	if (modelType === modelTypes.CONTAINER) {
		getModelFn = getContainerById;
	} else if (modelType === modelTypes.FEDERATION) {
		getModelFn = getFederationById;
	} else if (modelType === modelTypes.DRAWING) {
		getModelFn = getDrawingById;
	}

	const model = await getModelFn(teamspace, modelID, { permissions: 1 });

	const modelExists = await modelsExistInProject(teamspace, project, [modelID]);
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

// has read access to at least 1 model within the list
Permissions.hasReadAccessToSomeModels = async (teamspace, project, models, username) => {
	const permCheck = (perm) => MODEL_READ_ROLES.includes(perm.permission);
	const modelPerms = await findModels(teamspace, { _id: { $in: models } }, { permissions: 1 });
	return modelPerms.some(({ permissions }) => permissions
		&& permissions.some((perm) => perm.user === username && permCheck(perm)));
};

Permissions.hasWriteAccessToModel = modelPermCheck(
	(perm) => MODEL_WRITE_ROLES.includes(perm.permission), undefined,
);
Permissions.hasCommenterAccessToModel = modelPermCheck(
	(perm) => MODEL_COMMENT_ROLES.includes(perm.permission), undefined,
);
Permissions.hasReadAccessToModel = modelPermCheck(
	(perm) => MODEL_READ_ROLES.includes(perm.permission), undefined,
);

const hasAdminAccessToModel = async (teamspace, project, model, username) => {
	const [modelExistsInProject, hasAdminPerms] = await Promise.all([
		modelsExistInProject(teamspace, project, [model]),
		hasAdminPermissions(teamspace, project, username),
	]);

	return modelExistsInProject && hasAdminPerms > 0;
};

Permissions.hasAdminAccessToFederation = async (teamspace, project, federation, username) => {
	const [fed, adminAccess] = await Promise.all([
		getFederationById(teamspace, federation, { _id: 1 }),
		hasAdminAccessToModel(teamspace, project, federation, username),
	]);

	return fed && adminAccess;
};
Permissions.hasWriteAccessToFederation = modelPermCheck(
	(perm) => MODEL_WRITE_ROLES.includes(perm.permission), modelTypes.FEDERATION,
);
Permissions.hasCommenterAccessToFederation = modelPermCheck(
	(perm) => MODEL_COMMENT_ROLES.includes(perm.permission), modelTypes.FEDERATION,
);
Permissions.hasReadAccessToFederation = modelPermCheck(
	(perm) => MODEL_READ_ROLES.includes(perm.permission), modelTypes.FEDERATION,
);

Permissions.hasAdminAccessToContainer = async (teamspace, project, container, username) => {
	const [con, adminAccess] = await Promise.all([
		getContainerById(teamspace, container, { _id: 1 }),
		hasAdminAccessToModel(teamspace, project, container, username),
	]);

	return con && adminAccess;
};

Permissions.hasWriteAccessToContainer = modelPermCheck(
	(perm) => MODEL_WRITE_ROLES.includes(perm.permission), modelTypes.CONTAINER,
);
Permissions.hasCommenterAccessToContainer = modelPermCheck(
	(perm) => MODEL_COMMENT_ROLES.includes(perm.permission), modelTypes.CONTAINER,
);
Permissions.hasReadAccessToContainer = modelPermCheck(
	(perm) => MODEL_READ_ROLES.includes(perm.permission), modelTypes.CONTAINER,
);

Permissions.hasAdminAccessToDrawing = async (teamspace, project, drawingId, username) => {
	const [drawing, adminAccess] = await Promise.all([
		getDrawingById(teamspace, drawingId, { _id: 1 }),
		hasAdminAccessToModel(teamspace, project, drawingId, username),
	]);

	return drawing && adminAccess;
};

Permissions.hasWriteAccessToDrawing = modelPermCheck(
	(perm) => MODEL_WRITE_ROLES.includes(perm.permission), MODEL_TYPES.DRAWING,
);
Permissions.hasCommenterAccessToDrawing = modelPermCheck(
	(perm) => MODEL_COMMENT_ROLES.includes(perm.permission), MODEL_TYPES.DRAWING,
);
Permissions.hasReadAccessToDrawing = modelPermCheck(
	(perm) => MODEL_READ_ROLES.includes(perm.permission), modelTypes.DRAWING,
);

module.exports = Permissions;
