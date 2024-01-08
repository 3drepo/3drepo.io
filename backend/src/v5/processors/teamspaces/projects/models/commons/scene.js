/**
 *  Copyright (C) 2024 3D Repo Ltd
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

const Scene = {};

const { UUIDToString, stringToUUID } = require('../../../../../utils/helper/uuids');
const { getFile } = require('../../../../../services/filesManager');
const { getNodesBySharedIds } = require('../../../../../models/scenes');

Scene.getIdToMeshesMapping = async (teamspace, model, revId) => {
	const fileData = await getFile(teamspace, `${model}.stash.json_mpc`, `${UUIDToString(revId)}/idToMeshes.json`);
	return JSON.parse(fileData);
};

Scene.getMeshesWithParentIds = async (teamspace, project, container, revision, parentIds) => {
	const nodes = await getNodesBySharedIds(teamspace, project, container, revision, parentIds, { _id: 1 });
	const idToMeshes = await Scene.getIdToMeshesMapping(teamspace, container, revision);
	const meshes = [];
	nodes.forEach(({ _id }) => {
		const idStr = UUIDToString(_id);
		if (idToMeshes[idStr]) {
			idToMeshes[idStr].forEach((id) => {
				meshes.push(stringToUUID(id));
			});
		}
	});

	return meshes;
};

module.exports = Scene;
