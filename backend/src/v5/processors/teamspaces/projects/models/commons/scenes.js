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
const { idTypes, idTypesToKeys, metaKeyToIdType } = require('../../../../../models/metadata.constants');
const config = require('../../../../../utils/config');
const { getFile } = require('../../../../../services/filesManager');
const { getMetadataByQuery } = require('../../../../../models/metadata');
const { getNodesBySharedIds } = require('../../../../../models/scenes');

const contextCache = {};
let CACHE_EXPIRATION = config.testEnv ? 1 : 300000; // 5 minutes

const getIdToMeshesMapping = async (teamspace, model, revId, cacheExpiry = CACHE_EXPIRATION) => {
	const cacheKey = `${teamspace}/${model}/${UUIDToString(revId)}`;
	if (!contextCache[cacheKey]) {
		const fileData = await getFile(teamspace, `${model}.stash.json_mpc`, `${UUIDToString(revId)}/idToMeshes.json`);
		contextCache[cacheKey] = JSON.parse(fileData);
		setTimeout(() => {
			delete contextCache[cacheKey];
		}, cacheExpiry);
	}

	return contextCache[cacheKey];
};

// This function is only used by tests to avoid tests hanging due to an unresolved promise
Scene.setCacheExpiration = (expiry) => {
	CACHE_EXPIRATION = expiry;
};

// This function is only used by tests to clear the cache
Scene.clearCache = () => {
	Object.keys(contextCache).forEach((key) => delete contextCache[key]);
};

Scene.prepareCache = async (teamspace, model, revId, cacheExpiry = CACHE_EXPIRATION) => {
	await getIdToMeshesMapping(teamspace, model, revId, cacheExpiry);
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

	Object.values(idTypes).forEach((v) => { res[v] = []; });

	metadata.forEach((entry) => {
		// It may be possible that we are storing the same id in multiple metadata entries.
		// So we are keeping track of what we've already found
		const idCounted = new Set();

		(entry.metadata || []).forEach(({ key, value }) => {
			const idType = metaKeyToIdType[key];

			if (!idType || idCounted.has(idType)) return;

			idCounted.add(idType);
			res[idType].push(value);
		});
	});

	// If there is a specific type the user wanted, return them
	// This is currently explicity used for differencing therefore we don't care if
	// we can't represent them all - we may need to add a partial flag in the future
	if (wantedType) return { key: wantedType, values: res[wantedType] };

	// If we are determining the type, make sure we have a record for each metadata
	const targetCount = metadata.length;

	if (targetCount) {
		for (const idType of Object.keys(res)) {
			if (res[idType].length === targetCount) {
				// convert to set to purge duplicates
				return { key: idType, values: Array.from(new Set(res[idType])) };
			}
		}
	}

	return undefined;
};

Scene.sharedIdsToExternalIds = async (teamspace, container, revId, sharedIds) => {
	const externalIdKeys = Object.values(idTypesToKeys).flat();
	const query = { parents: { $in: sharedIds }, 'metadata.key': { $in: externalIdKeys }, rev_id: revId };
	const projection = { metadata: 1 };
	const metadata = await getMetadataByQuery(teamspace, container, query, projection);

	return Scene.getExternalIdsFromMetadata(metadata);
};

module.exports = Scene;
