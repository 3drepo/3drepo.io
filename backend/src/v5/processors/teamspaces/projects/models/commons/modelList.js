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
	addModel,
	deleteModel,
	getModelById,
	getModelByQuery,
	isSubModel,
	removeModelCollections,
} = require('../../../../../models/modelSettings');
const { addModelToProject, getProjectById, removeModelFromProject } = require('../../../../../models/projects');
const { hasProjectAdminPermissions, isTeamspaceAdmin } = require('../../../../../utils/permissions/permissions');
const { getFavourites } = require('../../../../../models/users');
const { logger } = require('../../../../../utils/logger');
const { removeAllFilesFromModel } = require('../../../../../models/fileRefs');
const { templates } = require('../../../../../utils/responseCodes');

const ModelList = {};

ModelList.addModel = async (teamspace, project, user, data) => {
	const { models } = await getProjectById(teamspace, project, { models: 1 });
	const query = { _id: { $in: models }, name: data.name };
	const modelSetting = await getModelByQuery(teamspace, query, { _id: 0, name: 1 });

	if (modelSetting) {
		throw templates.nameAlreadyExists;
	}

	const insertedId = await addModel(teamspace, data);

	await addModelToProject(teamspace, project, insertedId);

	return insertedId;
};

ModelList.deleteModel = async (teamspace, project, model) => {
	const setting = await getModelById(teamspace, model);

	if (!setting.federate && (await isSubModel(teamspace, model))) {
		throw templates.containerIsSubModel;
	}

	try {
		await removeAllFilesFromModel(teamspace, model);
	} catch (err) {
		logger.logDebug(`[Delete model] : ${JSON.stringify(err)}`);
	}

	await Promise.all([
		removeModelCollections(teamspace, model),
		deleteModel(teamspace, model),
		removeModelFromProject(teamspace, project, model),
	]);
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
