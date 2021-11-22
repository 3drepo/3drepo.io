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

async function getNodeBySharedId(account, model, shared_id, revisionIds, projection = {}) {
	return await db.findOne(account, getSceneCollectionName(model), {shared_id, _id :{$in: revisionIds}}, projection);
}

async function findNodes(account, model, branch, revision, query = {}, projection = {}) {
	const history = await History.getHistory(account, model, branch, revision);

	return cleanAll(await db.find(account, getSceneCollectionName(model), { rev_id: history._id, ...query}, projection));
}

const Scene = {};

Scene.findNodesByField = async function (account, model, branch, revision, fieldName, projection = {}) {
	const query = {"metadata.key": fieldName};
	const proj = {parents: 1, metadata: {$elemMatch: {key: fieldName}}, ...projection};

	return findNodes(account, model, branch, revision, query, proj);
};

Scene.findNodesByType = async function (account, model, branch, revision, type, searchString, projection) {
	const query = {
		type
	};

	if (searchString) {
		query.name = new RegExp(searchString, "i");
	}

	return findNodes(account, model, branch, revision, query, projection);
};

Scene.getGridfsFileStream = async function (account, model, filename) {
	return await ExternalServices.getFileStream(account, getSceneCollectionName(model), "gridfs", filename);
};

Scene.getNodeById = async function (account, model, id, projection = {}) {
	return clean(await db.findOne(account, getSceneCollectionName(model), {_id: id}, projection));
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
