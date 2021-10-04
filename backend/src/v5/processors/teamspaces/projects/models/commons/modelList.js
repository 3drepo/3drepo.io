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

const { addModel, deleteModel, getModelByName } = require('../../../../../models/modelSettings');
const { addProjectModel, getProjectById } = require('../../../../../models/projects');
const { hasProjectAdminPermissions, isTeamspaceAdmin } = require('../../../../../utils/permissions/permissions');
const { getFavourites } = require('../../../../../models/users');
const { templates } = require('../../../../../utils/responseCodes');

const ModelList = {};

ModelList.addModel = async (teamspace, project, user, data) => {
	const { models, permissions } = await getProjectById(teamspace, project, { permissions: 1, models: 1 });

	const isTSAdmin = await isTeamspaceAdmin(teamspace, user);
	const isAdmin = isTSAdmin || hasProjectAdminPermissions(permissions, user);

	if (!isAdmin) {
		throw templates.notAuthorized;
	}

	const modelSetting = await getModelByName(teamspace, models, data.name, { _id: 0, name: 1 });

	if (modelSetting) {
		throw templates.duplicateModelName;
	}

	const response = await addModel(teamspace, data);

	await addProjectModel(teamspace, project, response.insertedId);

	return response.insertedId;
};

ModelList.deleteModel = async (teamspace, project, model, user) => {
	const { permissions } = await getProjectById(teamspace, project, { permissions: 1, models: 1 });

	const isTSAdmin = await isTeamspaceAdmin(teamspace, user);
	const isAdmin = isTSAdmin || hasProjectAdminPermissions(permissions, user);

	if (!isAdmin) {
		throw templates.notAuthorized;
	}

	const response = await deleteModel(teamspace, model);

	if (response.deletedCount === 0) {
		throw templates.modelNotFound;
	}
};

ModelList.getModelList = async (teamspace, project, user, modelSettings) => {
	const { permissions } = await getProjectById(teamspace, project, { permissions: 1, models: 1 });

	const [isTSAdmin, favourites] = await Promise.all([
		isTeamspaceAdmin(teamspace, user),
		getFavourites(user, teamspace),
	]);

	const isAdmin = isTSAdmin || hasProjectAdminPermissions(permissions, user);

	return modelSettings.flatMap(({ _id, name, permissions: modelPerms }) => {
		const perm = modelPerms ? modelPerms.find((entry) => entry.user === user) : undefined;
		return (!isAdmin && !perm)
			? [] : { _id, name, role: isAdmin ? 'admin' : perm.permission, isFavourite: favourites.includes(_id) };
	});
};

module.exports = ModelList;
