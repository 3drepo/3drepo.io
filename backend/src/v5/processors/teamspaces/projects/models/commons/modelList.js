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

const { addModel, getContainers } = require('../../../../../models/modelSettings');
const { addModelToProject, getProjectById, removeModelFromProject } = require('../../../../../models/projectSettings');
const { getLatestRevision, getRevisionByIdOrTag } = require('../../../../../models/revisions');
const { hasProjectAdminPermissions, isTeamspaceAdmin } = require('../../../../../utils/permissions/permissions');
const CryptoJs = require('crypto-js');
const { USERS_DB_NAME } = require('../../../../../models/users.constants');
const UUIDParse = require('uuid-parse');
const { getFavourites } = require('../../../../../models/users');
const { getFile } = require('../../../../../services/filesManager');
const { getRefEntry } = require('../../../../../models/fileRefs');
const { modelTypes } = require('../../../../../models/modelSettings.constants');
const { removeModelData } = require('../../../../../utils/helper/models');

const ModelList = {};

ModelList.addModel = async (teamspace, project, data) => {
	const insertedId = await addModel(teamspace, project, data);

	await addModelToProject(teamspace, project, insertedId);

	return insertedId;
};

ModelList.deleteModel = async (teamspace, project, model) => {
	await removeModelData(teamspace, project, model);
	await removeModelFromProject(teamspace, project, model);
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
			? [] : {
				_id,
				name,
				role: isAdmin ? USERS_DB_NAME : perm.permission,
				isFavourite: favourites.includes(_id),
			};
	});
};

ModelList.getModelMD5Hash = async (teamspace, container, revision, user) => {
	const [isAdmin, containers] = await Promise.all([
		isTeamspaceAdmin(teamspace, user),
		getContainers(teamspace, [container], { _id: 1, name: 1, permissions: 1 }),
	]);
	let rev;
	let returnValue;

	// if not allowed just return nothing
	if (!isAdmin && !containers[0].permissions?.some((permission) => permission?.user === user)) return returnValue;

	// retrieve the right revision
	if (revision?.length) {
		rev = await getRevisionByIdOrTag(
			teamspace, container, modelTypes.CONTAINER, revision,
			{ rFile: 1, timestamp: 1, fileSize: 1 },
			{ includeVoid: false });
	} else {
		rev = await getLatestRevision(
			teamspace, container, modelTypes.CONTAINER,
			{ rFile: 1, timestamp: 1, fileSize: 1 });
	}

	// check if anything is in there
	if (!rev.rFile?.length) return returnValue;

	const filename = rev.rFile[0];

	const file = await getFile(teamspace, `${container}.history`, filename);
	const refEntry = await getRefEntry(teamspace, `${container}.history.ref`, filename);

	const hash = CryptoJs.MD5(file).toString();
	const code = UUIDParse.unparse(rev._id.buffer);
	const uploadedAt = new Date(rev.timestamp).getTime();

	returnValue = {
		container,
		code,
		uploadedAt,
		hash,
		filename,
		size: refEntry.size,
	};

	return returnValue;
};

module.exports = ModelList;
