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

"use strict";
const utils = require("../utils");
const db = require("../handler/db");
const ExternalServices = require("../handler/externalServices");
const matrix = require("./helper/matrix");
const History = require("./history");
const {v5Path} = require("../../interop");
const { sanitiseRegex } = require(`${v5Path}/utils/helper/strings`);
const Models = require(`${v5Path}/models/modelSettings`);

function clean(nodeToClean) {
	if (nodeToClean) {
		if (nodeToClean._id) {
			nodeToClean._id = utils.uuidToString(nodeToClean._id);
		}

		if (nodeToClean.parents) {
			nodeToClean.parents = nodeToClean.parents.map(p => utils.uuidToString(p));
		}
	}

	return nodeToClean;
}

function cleanAll(nodesToClean) {
	return nodesToClean.map(clean);
}

function getSceneCollectionName(model) {
	return model + ".scene";
}

function getSceneStashCollectionName(model) {
	return model + ".stash.3drepo";
}

async function getNodeBySharedId(account, model, shared_id, revisionIds, projection = {}) {
	return await db.findOne(account, getSceneCollectionName(model), { shared_id, rev_id: { $in: revisionIds } }, projection);
}

async function findNodes(account, model, branch, revision, query = {}, projection = {}) {
	const history = await History.getHistory(account, model, branch, revision);

	return cleanAll(await db.find(account, getSceneCollectionName(model), { rev_id: history._id, ...query }, projection));
}

async function findStashNodes(account, model, branch, revision, query = {}, projection = {}) {
	const history = await History.getHistory(account, model, branch, revision);

	return cleanAll(await db.find(account, getSceneStashCollectionName(model), { rev_id: history._id, ...query}, projection));
}

const Scene = {};

Scene.findNodes = findNodes;
Scene.findNodesByField = async function (account, model, branch, revision, fieldName, projection = {}) {
	const query = { "metadata.key": fieldName };
	const proj = { parents: 1, metadata: { $elemMatch: { key: fieldName } }, ...projection };

	return findNodes(account, model, branch, revision, query, proj);
};

Scene.findNodesByType = async function (account, model, branch, revision, type, searchString, projection) {
	const query = {
		type
	};

	if (searchString) {
		const sanitisedSearchString = sanitiseRegex(searchString);
		query.name = new RegExp(sanitisedSearchString, "i");
	}

	return findNodes(account, model, branch, revision, query, projection);
};

Scene.findStashNodesByType = async function (account, model, branch, revision, type, searchString, projection) {
	const query = {
		type
	};

	if (searchString) {
		query.name = new RegExp(searchString, "i");
	}

	return findStashNodes(account, model, branch, revision, query, projection);
};

Scene.findMetadataNodesByFields = async function (account, model, branch, revision, fieldNames = [], projection = {}) {
	const history = await History.getHistory(account, model, branch, revision);
	const query = { $match: { rev_id: history._id, type: "meta" } };
	projection = { $project: { ...projection, metadata: 1, parents: 1 } };

	if (fieldNames.length) {
		query.$match["metadata.key"] = { $in: fieldNames };
		projection.$project.metadata = { $filter: { input: "$metadata", as: "metadata", cond: { $in: ["$$metadata.key", fieldNames] } } };
	}

	return cleanAll(await db.aggregate(account, getSceneCollectionName(model), [query, projection]));
};

Scene.getGridfsFileStream = async function (account, model, filename) {
	return ExternalServices.getFileStream(account, getSceneCollectionName(model), "gridfs", filename);
};

Scene.getNodeById = async function (account, model, id, projection = {}) {
	return clean(await db.findOne(account, getSceneCollectionName(model), { _id: id }, projection));
};

Scene.getMeshInfo = async (account, model, branch, rev, user) => {
	const isFed = await Models.isFederation(account, model);
	if(isFed) {
		const refNodes = await Scene.findNodesByType(account, model, branch, rev, "ref", undefined, {project: 1});
		const { hasReadAccessToModelHelper } = require("../middlewares/middlewares");
		const C = require("../constants");
		const subModelMeshes = await Promise.all(refNodes.map(async ({project}) => {
			if(await hasReadAccessToModelHelper(user, account, project)) {
				try{
					const superMeshes = await Scene.getMeshInfo(account, project, C.MASTER_BRANCH_NAME, undefined, user);
					return { teamspace: account, model: project, superMeshes };
				}catch{
					return;
				}
			}
		}));
		return { subModels: subModelMeshes.filter(Boolean) };

	} else {
		const Utils = require("../utils");
		const projection = {
			_id: 1,
			vertices_count : 1,
			faces_count: 1,
			uv_channels_count: 1,
			bounding_box: 1,
			primitive: 1
		};
		const results = await Scene.findStashNodesByType(account, model, branch, rev, "mesh", undefined, projection);
		return {
			superMeshes: results.map(({_id, vertices_count, faces_count, uv_channels_count, bounding_box, primitive}) => ({
				_id: Utils.uuidToString(_id),
				nVertices: vertices_count || 0,
				nFaces: faces_count || 0,
				nUVChannels: uv_channels_count || 0,
				primitive: primitive || 3,
				min: bounding_box[0],
				max: bounding_box[1]
			}))
		};

	}
};

Scene.getParentMatrix = async function (account, model, parent, revisionIds) {
	const mesh = await getNodeBySharedId(account, model, utils.stringToUUID(parent), revisionIds);

	if ((mesh.parents || []).length > 0) {
		const parentMatrix = await Scene.getParentMatrix(account, model, mesh.parents[0], revisionIds);
		if (mesh.matrix) {
			return matrix.multiply(parentMatrix, mesh.matrix);
		}
	}

	return mesh.matrix || matrix.getIdentity(4);
};

module.exports = Scene;
