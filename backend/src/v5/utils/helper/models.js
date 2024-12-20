/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const { removeAllFilesFromModel, removeFilesWithMeta } = require('../../services/filesManager');
const { BinToFaceStringStream } = require('./binaryFace');
const { BinToVector3dStringStream } = require('./binaryVector');
const CombinedStream = require('combined-stream');
const Scene = require('../../models/scenes');
const { TICKETS_RESOURCES_COL } = require('../../models/tickets.constants');
const db = require('../../handler/db');
const { deleteModel } = require('../../models/modelSettings');
const { getFileAsStream } = require('../../services/filesManager');
const { removeAllTicketsInModel } = require('../../models/tickets');
const stringToStream = require('string-to-stream');
const { templates } = require('../responseCodes');
const uuidHelper = require('./uuids');

const ModelHelper = {};

const removeModelCollections = async (ts, model) => {
	const collections = await db.listCollections(ts);
	const promises = collections.flatMap(({ name }) => (name.startsWith(`${model}.`) ? db.dropCollection(ts, name) : []));
	await Promise.all(promises);
};

const getMeshDataFromRef = async (account, model, refObj) => {
	const { elements, buffer } = refObj;

	// nodejs API on createReadStream : start and end index are inclusive, thus we need -1 on end
	const verticeRegion = {
		start: buffer.start + elements.vertices.start,
		end: buffer.start + elements.vertices.start + elements.vertices.size - 1,
	};
	const faceRegion = {
		start: buffer.start + elements.faces.start,
		end: buffer.start + elements.faces.start + elements.faces.size - 1,
	};

	const { readStream: vertices } = await getFileAsStream(account, `${model}.scene`, buffer.name, verticeRegion);
	const { readStream: faces } = await getFileAsStream(account, `${model}.scene`, buffer.name, faceRegion);

	return { vertices, faces };
};

ModelHelper.removeModelData = async (teamspace, project, model) => {
	// This needs to be done before removeModelCollections or we risk the .ref col being deleted before we check it
	await removeAllFilesFromModel(teamspace, model);

	await Promise.all([
		removeModelCollections(teamspace, model),
		deleteModel(teamspace, project, model).catch((err) => {
			if (err.code !== templates.modelNotFound.code) throw err;
		}),
		removeAllTicketsInModel(teamspace, project, model),
		removeFilesWithMeta(teamspace, TICKETS_RESOURCES_COL, { teamspace, project, model }),
	]);
};

ModelHelper.getMeshById = async (teamspace, container, meshId) => {
	const projection = {
		parents: 1,
		vertices: 1,
		faces: 1,
		_blobRef: 1,
		primitive: 1,
		rev_id: 1,
	};

	const mesh = await Scene.getNodeById(teamspace, container, uuidHelper.stringToUUID(meshId), projection);

	if (!mesh) {
		throw templates.meshNotFound;
	}

	mesh.matrix = await Scene.getParentMatrix(teamspace, container, mesh.parents[0], [mesh.rev_id]);

	let res;

	// eslint-disable-next-line no-underscore-dangle
	if (mesh._blobRef) {
		// eslint-disable-next-line no-underscore-dangle
		res = await getMeshDataFromRef(teamspace, container, mesh._blobRef);
	} else {
		throw templates.meshDataNotFound;
	}

	const { vertices, faces } = res;

	if (!('primitive' in mesh)) { // if the primitive type is missing, then set it to triangles for backwards compatibility. this matches the behaviour of the bouncer api.
		mesh.primitive = 3;
	}

	const combinedStream = CombinedStream.create();
	combinedStream.append(stringToStream(['{"matrix":', JSON.stringify(mesh.matrix)].join('')));
	combinedStream.append(stringToStream([',"primitive":', mesh.primitive].join('')));
	combinedStream.append(stringToStream(',"vertices":['));
	combinedStream.append(vertices.pipe(new BinToVector3dStringStream({ isLittleEndian: true })));
	combinedStream.append(stringToStream('],"faces":['));
	combinedStream.append(faces.pipe(new BinToFaceStringStream({ isLittleEndian: true })));
	combinedStream.append(stringToStream(']}'));

	return {
		readStream: combinedStream,
		size: combinedStream.dataSize,
		mimeType: '"application/json; charset=utf-8"',
		encoding: false,
		filename: undefined,
	};
};

module.exports = ModelHelper;
