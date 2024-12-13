/**
 *  Copyright (C) 2023 3D Repo Ltd
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
const DbConstants = require('../handler/db.constants');
const History = require('./history');
const Permissions = require('../utils/permissions/permissions');
const db = require('../handler/db');
const uuidHelper = require('../utils/helper/uuids');

const getCollection = (model) => `${model}.scene`;
const getStashCollection = (model) => `${model}.stash.3drepo`;

Scene.getNodesBySharedIds = (teamspace, project, model, revId, sharedIds, projection) => db.find(
	teamspace, getCollection(model), { rev_id: revId, shared_id: { $in: sharedIds } }, projection);

Scene.getNodesByIds = (teamspace, project, model, ids, projection) => db.find(
	teamspace, getCollection(model), { _id: { $in: ids } }, projection);

const clean = (nodeToClean) => {
	const node = nodeToClean;
	if (node) {
		if (node._id) {
			node._id = uuidHelper.UUIDToString(node._id);
		}

		if (node.parents) {
			node.parents = node.parents.map((p) => uuidHelper.UUIDToString(p));
		}
	}

	return node;
};

const cleanAll = (nodesToClean) => nodesToClean.map(clean);

const findNodes = async (account, model, branch, revision, query = {}, projection = {}) => {
	const history = await History.getHistory(account, model, branch, revision);

	const nodes = await db.find(account, getCollection(model), { rev_id: history._id, ...query }, projection);
	return cleanAll(nodes);
};

const findStashNodes = async (account, model, branch, revision, query = {}, projection = {}) => {
	const history = await History.getHistory(account, model, branch, revision);

	const results = await db.find(
		account,
		getStashCollection(model),
		{ rev_id: history._id, ...query },
		projection,
	);

	return cleanAll(results);
};

Scene.findStashNodesByType = async (account, model, branch, revision, type, searchString, projection) => {
	const query = {
		type,
	};

	if (searchString) {
		query.name = new RegExp(searchString, 'i');
	}

	const result = await findStashNodes(account, model, branch, revision, query, projection);
	return result;
};

Scene.findNodesByType = async (account, model, branch, revision, type, searchString, projection) => {
	const query = {
		type,
	};

	if (searchString) {
		query.name = new RegExp(searchString, 'i');
	}

	const result = await findNodes(account, model, branch, revision, query, projection);
	return result;
};

Scene.getContainerMeshInfo = async (teamspace, model, branch, rev) => {
	const projection = {
		_id: 1,
		vertices_count: 1,
		faces_count: 1,
		uv_channels_count: 1,
		bounding_box: 1,
		primitive: 1,
	};
	const results = await Scene.findStashNodesByType(teamspace, model, branch, rev, 'mesh', undefined, projection);
	return {
		superMeshes: results.map(({
			_id,
			vertices_count,
			faces_count,
			uv_channels_count,
			bounding_box,
			primitive,
		}) => ({
			_id: uuidHelper.UUIDToString(_id),
			max: bounding_box[1],
			min: bounding_box[0],
			nFaces: faces_count || 0,
			nUVChannels: uv_channels_count || 0,
			nVertices: vertices_count || 0,
			primitive: primitive || 3,
		})),
	};
};

Scene.getFederationMeshInfo = async (ts, proj, federation, branch, rev, user) => {
	const refNodes = await Scene.findNodesByType(ts, federation, branch, rev, 'ref', undefined, { project: 1 });

	const subModelMeshes = await Promise.all(refNodes.map(async (node) => {
		// Note that in this table, the "project" column actually contains the IDs of containers
		const container = node.project;
		if (await Permissions.hasReadAccessToContainer(ts, proj, container, user.username)) {
			try {
				const superMeshes = await Scene.getContainerMeshInfo(
					ts,
					container,
					DbConstants.MASTER_BRANCH_NAME,
					undefined,
				);
				return { teamspace: ts, model: container, superMeshes };
			} catch {
				return undefined;
			}
		}
		return undefined;
	}));

	return { subModels: subModelMeshes.filter(Boolean) };
};

module.exports = Scene;
