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

const { UUIDToString, stringToUUID, unique } = require('../../../../../utils/helper/uuids');
const { getFile, getFileAsStream } = require('../../../../../services/filesManager');
const { getNodeByQuery, getNodesByQuery, getNodesBySharedIds } = require('../../../../../models/scenes');
const { idTypes, idTypesToKeys, metaKeyToIdType } = require('../../../../../models/metadata.constants');
const CombinedStream = require('combined-stream');
const GeoMaths = require('../../../../../utils/helper/geoMaths');
const config = require('../../../../../utils/config');
const { getMetadataByQuery } = require('../../../../../models/metadata');
const { getRevisionByIdOrTag } = require('../../../../../models/revisions');
const { getSuperMeshesInRevision } = require('../../../../../models/scenes.stash');
const { modelTypes } = require('../../../../../models/modelSettings.constants');
const { nodeTypes } = require('../../../../../models/scenes.constants');
const stringToStream = require('string-to-stream');
const { templates } = require('../../../../../utils/responseCodes');

const contextCache = {};

/* istanbul ignore next */
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

const getMeshParent = (node, meshId = node._id) => {
	if (!node.parents?.[0]) {
		throw new Error(`Invalid scene data: mesh ${UUIDToString(meshId)} is missing a parent`);
	}

	return node.parents[0];
};

Scene.getBoundsForGroupsOfMeshNodes = async (teamspace, project, container, revision, meshIdGroups) => {
	const expandBounds = (bounds, { min, max }) => {
		if (!bounds) return { min: [...min], max: [...max] };

		return {
			min: bounds.min.map((value, i) => Math.min(value, min[i])),
			max: bounds.max.map((value, i) => Math.max(value, max[i])),
		};
	};

	/* Flatten the list of meshIds and get all their parents and bounds info in one go */
	const meshIdGroupKeys = meshIdGroups.map((group) => group.map(UUIDToString));
	const meshIds = unique(meshIdGroups.flat());

	const [meshNodes, { coordOffset = [0, 0, 0] }] = await Promise.all([
		getNodesByQuery(teamspace, project, container, {
			_id: { $in: meshIds },
			type: nodeTypes.MESH,
		}, { _id: 1, parents: 1, bounding_box: 1 }),
		getRevisionByIdOrTag(teamspace, container,
			modelTypes.CONTAINER, revision, { coordOffset: 1 }),
	]);

	const meshToBounds = {};
	meshNodes.forEach((node) => {
		const [min, max] = node.bounding_box;
		meshToBounds[UUIDToString(node._id)] = {
			parent: getMeshParent(node),
			min,
			max,
		};
	});

	if (!Object.keys(meshToBounds).length) return meshIdGroups.map(() => undefined);

	/* Get all the transforms from all parents and their ancestors (this is effectively a recursion loop) */
	const transforms = {};
	const getTransform = (parentId) => transforms[UUIDToString(parentId)];
	let parentIds = unique(Object.values(meshToBounds).map(({ parent }) => parent));
	while (parentIds.length) {
		const missingParentIds = new Set(parentIds.map(UUIDToString));

		// eslint-disable-next-line no-await-in-loop
		const transformationNodes = await getNodesByQuery(teamspace, project, container, {
			shared_id: { $in: parentIds },
			type: nodeTypes.TRANSFORMATION,
		}, { shared_id: 1, parents: 1, matrix: 1 });

		transformationNodes.forEach((node) => {
			missingParentIds.delete(UUIDToString(node.shared_id));
			transforms[UUIDToString(node.shared_id)] = {
				parent: node.parents?.[0],
				transform: node.matrix ?? GeoMaths.matrices.identity(),
			};
		});

		if (missingParentIds.size) {
			throw new Error(`Invalid scene data: transformation ${Array.from(missingParentIds).join(', ')} is missing`);
		}

		parentIds = unique(parentIds.flatMap((parentId) => {
			const { parent } = getTransform(parentId);
			return parent && !getTransform(parent) ? [parent] : [];
		}));
	}

	const cumulativeTransforms = {};
	const getCumulativeTransform = (parentId) => {
		if (!parentId) return GeoMaths.matrices.identity();
		const parentIdStr = UUIDToString(parentId);
		if (!cumulativeTransforms[parentIdStr]) {
			const parent = transforms[parentIdStr];
			cumulativeTransforms[parentIdStr] = GeoMaths.matrices.multiply(
				getCumulativeTransform(parent.parent),
				parent.transform,
			);
		}

		return cumulativeTransforms[parentIdStr];
	};

	return meshIdGroupKeys.map((group) => {
		let bounds;
		for (const meshIdKey of group) {
			const bound = meshToBounds[meshIdKey];
			if (bound) {
				const transform = getCumulativeTransform(bound.parent);
				const min = GeoMaths.vectors.add(GeoMaths.vectors.transform(transform, bound.min), coordOffset);
				const max = GeoMaths.vectors.add(GeoMaths.vectors.transform(transform, bound.max), coordOffset);
				bounds = expandBounds(bounds, {
					min: min.map((value, i) => Math.min(value, max[i])),
					max: max.map((value, i) => Math.max(value, min[i])),
				});
			}
		}
		return bounds;
	});
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
	if (wantedType) {
		return { key: wantedType, values: Array.from(new Set(res[wantedType])) };
	}

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

const calculateNodeMatrix = async (teamspace, project, container, sharedId) => {
	const transNode = await getNodeByQuery(teamspace, project, container,
		{ shared_id: sharedId, type: nodeTypes.TRANSFORMATION }, { parents: 1, matrix: 1 });
	if (!transNode) {
		throw new Error(`Invalid scene data: transformation ${UUIDToString(sharedId)} is missing`);
	}

	if ((transNode.parents || []).length > 0) {
		const parentMatrix = await calculateNodeMatrix(teamspace, project, container, transNode.parents[0]);
		return GeoMaths.matrices.multiply(parentMatrix, transNode.matrix ?? GeoMaths.matrices.identity());
	}

	return transNode.matrix ?? GeoMaths.matrices.identity();
};

const fetchMeshBinariesStreams = async (teamspace, container, refObj) => {
	const { elements: { vertices, faces }, buffer: { start: startIndex, name } } = refObj;

	// nodejs API on createReadStream : start and end index are inclusive, thus we need -1 on end
	const verticeRegion = {
		start: startIndex + vertices.start,
		end: startIndex + vertices.start + vertices.size - 1,
	};
	const faceRegion = {
		start: startIndex + faces.start,
		end: startIndex + faces.start + faces.size - 1,
	};

	const { readStream: verticesStream } = await getFileAsStream(teamspace, `${container}.scene`, name, verticeRegion);
	const { readStream: facesStream } = await getFileAsStream(teamspace, `${container}.scene`, name, faceRegion);

	return { verticesStream, facesStream };
};

Scene.getTexture = async (teamspace, project, container, textureId) => {
	const textureNode = await getNodeByQuery(teamspace, project, container,
		{ _id: textureId, type: nodeTypes.TEXTURE }, {
			_id: 1,
			_blobRef: 1,
			extension: 1,
		});

	// eslint-disable-next-line no-underscore-dangle
	if (!textureNode || !textureNode._blobRef) {
		throw templates.textureNotFound;
	}

	const { _blobRef: { elements, buffer } } = textureNode;

	// chunkInfo is passed to createReadStream, which expects `start` and `end` properties
	const chunkInfo = {
		start: buffer.start + elements.data.start,
		end: buffer.start + elements.data.start + elements.data.size,
	};

	const res = await getFileAsStream(teamspace, `${container}.scene`, buffer.name, chunkInfo);

	const mimeType = `image/${textureNode.extension === 'jpg' ? 'jpeg' : textureNode.extension}`;

	return { ...res, mimeType, size: chunkInfo.end - chunkInfo.start };
};

Scene.getMeshData = async (teamspace, project, container, meshId) => {
	const projection = {
		parents: 1,
		_blobRef: 1,
		primitive: 1,
	};

	const meshNode = await getNodeByQuery(teamspace, project, container,
		{ _id: meshId, type: nodeTypes.MESH }, projection);

	// eslint-disable-next-line no-underscore-dangle
	if (!meshNode || !meshNode._blobRef) {
		throw templates.meshNotFound;
	}

	const matrix = await calculateNodeMatrix(teamspace, project, container, getMeshParent(meshNode, meshId));
	const mesh = meshNode;

	// eslint-disable-next-line no-underscore-dangle
	const { verticesStream, facesStream } = await fetchMeshBinariesStreams(teamspace, container, mesh._blobRef);

	const combinedStream = CombinedStream.create();
	combinedStream.append(stringToStream(['{"matrix":', JSON.stringify(matrix)].join('')));
	combinedStream.append(stringToStream([',"primitive":', mesh.primitive || 3].join('')));
	combinedStream.append(stringToStream(',"vertices":['));
	combinedStream.append(GeoMaths.vectors.toJSONStream(verticesStream));
	combinedStream.append(stringToStream('],"faces":['));
	combinedStream.append(GeoMaths.faces.toJSONStream(facesStream));
	combinedStream.append(stringToStream(']}'));
	return combinedStream;
};

Scene.getSuperMeshesInfo = async (teamspace, container, revision) => {
	const projection = {
		_id: 1,
		vertices_count: 1,
		faces_count: 1,
		uv_channels_count: 1,
		bounding_box: 1,
		primitive: 1,
	};
	const superMeshes = await getSuperMeshesInRevision(teamspace, container, revision, projection);
	return { superMeshes };
};

module.exports = Scene;
