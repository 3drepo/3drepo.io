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
const { idTypesToKeys, metaKeyToIdType } = require('../../../../../models/metadata.constants');
const { getFile } = require('../../../../../services/filesManager');
const { getMetadataByQuery } = require('../../../../../models/metadata');
const { getNodesBySharedIds } = require('../../../../../models/scenes');

const getIdToMeshesMapping = async (teamspace, model, revId) => {
	const fileData = await getFile(teamspace, `${model}.stash.json_mpc`, `${UUIDToString(revId)}/idToMeshes.json`);
	return JSON.parse(fileData);
};

Scene.getMeshesWithParentIds = async (teamspace, project, container, revision, parentIds, returnString = false) => {
	const nodes = await getNodesBySharedIds(teamspace, project, container, revision, parentIds, { _id: 1 });
	const idToMeshes = await getIdToMeshesMapping(teamspace, container, revision);
	const meshes = new Set();
	nodes.forEach(({ _id }) => {
		const idStr = UUIDToString(_id);
		if (idToMeshes[idStr]) {
			idToMeshes[idStr].forEach((val) => meshes.add(val));
		}
	});

	const meshesArr = Array.from(meshes);
	return returnString ? meshesArr : meshesArr.map(stringToUUID);
};

Scene.getExternalIdsFromMetadata = (metadata, wantedType) => {
	const res = {};
	metadata.forEach((entry) => {
		// It may be possible that we are storing the same id in multiple metadata entries.
		// So we are keeping track of what we've already found
		const idCounted = new Set();

		(entry.metadata || []).forEach(({ key, value }) => {
			const idType = metaKeyToIdType[key];

			if (!idType || idCounted.has(idType)) return;

			idCounted.add(idType);

			if (!res[idType]) {
				res[idType] = [value];
			} else {
				res[idType].push(value);
			}
		});
	});

	// If there is a specific type the user wanted, return them
	// This is currently explicity used for differencing therefore we don't care if
	// we can't represent them all - we may need to add a partial flag in the future
	if (wantedType) return res[wantedType];

	// If we are determining the type, make sure we have a record for each metadata
	const targetCount = metadata.length;

	for (const idType of Object.keys(res)) {
		if (res[idType].length === targetCount) {
			return { key: idType, values: res[idType] };
		}
	}

	return undefined;
};

Scene.sharedIdsToExternalIds = async (teamspace, container, revId, sharedIds) => {
	const externalIdKeys = Object.values(idTypesToKeys).flat();
	const query = { parents: { $in: sharedIds }, 'metadata.key': { $in: externalIdKeys }, rev_id: revId };
	const projection = { metadata: { $elemMatch: { $or: externalIdKeys.map((n) => ({ key: n })) } } };
	const metadata = await getMetadataByQuery(teamspace, container, query, projection);

	return Scene.getExternalIdsFromMetadata(metadata);
};

module.exports = Scene;
