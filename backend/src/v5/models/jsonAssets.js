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

const DB = require('../handler/db');

const FilesManager = require('../services/filesManager');
const History = require('./history');
const ModelSettings = require('./modelSettings');
const Scene = require('./scenes');
const Stream = require('stream');
const jsonAssetsConstants = require('./jsonAssets.constants');
const uuidHelper = require('../utils/helper/uuids');
// const { hasReadAccessToModelHelper } = require("../middlewares/checkPermissions");

const JSONAssets = {};

const getJSONCollection = (model) => `${model}${jsonAssetsConstants.JSON_FILE_REF_EXT}`;

const getJSONFileStream = async (teamspace, model, fileName) => {
	const collection = getJSONCollection(model);
	const stream = await FilesManager.getFileAsStream(teamspace, collection, fileName);
	return stream;
};

const storeJSONFileStream = async (teamspace, model, data, name, extraFields = {}) => {
	const collection = getJSONCollection(model);
	const meta = { _id: name, ...extraFields };
	await FilesManager.storeFileStream(teamspace, collection, name, data, meta);
};

const removeJSONFile = async (teamspace, model, name) => {
	const collection = getJSONCollection(model);
	await FilesManager.removeFile(teamspace, collection, name);
};

const jsonFileExists = async (teamspace, model, fileName) => {
	const collection = getJSONCollection(model);
	const result = await FilesManager.fileExists(teamspace, collection, fileName);
	return result;
};

// Note: in v4, this was part of its own file. Is it still used enough to
// justify this again? See if other routes also need it.
const getRefNodes = async (teamspace, federation, branch, rev) => {
	const settings = await ModelSettings.getModelById(teamspace, federation);
	// TODO FT: Should I clean as in the old v4 route?
	if (settings.federate) {
		const result = await Scene.findNodesByType(teamspace, federation, branch, rev, 'ref', undefined);
		return result;
	}

	return [];
};

const splitEntriesToGroups = (entries, maxParallelFiles = 100) => {
	const groups = [];

	let currentGroup = [];
	for (const entry of entries) {
		if (currentGroup.length >= maxParallelFiles) {
			groups.push(currentGroup);
			currentGroup = [];
		}

		currentGroup.push(entry);
	}

	if (currentGroup.length) {
		groups.push(currentGroup);
	}

	return groups;
};

const generateSuperMeshMappings = async (account, model, jsonFiles, outStream) => {
	const regex = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})[^/]*$/;

	const startStr = `{"model":"${model}","supermeshes":[`;
	outStream.write(startStr);

	const fileGroups = splitEntriesToGroups(jsonFiles);
	for (let j = 0; j < fileGroups.length; ++j) {
		const filesToProcess = fileGroups[j];
		// Note: Keep this sequential due to readability and the stream below
		// eslint-disable-next-line no-await-in-loop
		const files = await Promise.all(
			filesToProcess.map(async (fileName) => {
				const regexRes = fileName.match(regex);
				return { fileName, file: await getJSONFileStream(account, model, regexRes[0]) };
			}));

		for (let i = 0; i < files.length; ++i) {
			const { fileName, file } = files[i];

			const regexRes = fileName.match(regex);
			const id = regexRes[1];
			if (file) {
				outStream.write(`{"id":"${id}","data":`);
				const { readStream } = file;

				// Note: Keep this sequential due to readability and the stream below
				// eslint-disable-next-line no-await-in-loop
				await new Promise((resolve) => {
					readStream.on('data', (d) => {
						outStream.write(d);
					});
					readStream.on('end', () => {
						resolve();
					});
					readStream.on('error', (err) => {
						outStream.emit('error', err);
					});
				});

				const eofStr = `}${fileName !== jsonFiles[jsonFiles.length - 1] ? ',' : ''}`;
				outStream.write(eofStr);
			}
		}
	}

	const endingStr = ']}';
	outStream.write(endingStr);
	outStream.end();
};

const addSuperMeshMappingsToStream = async (account, model, revId, jsonFiles, outStream) => {
	const cacheFileName = `${uuidHelper.UUIDToString(revId)}/supermeshes.json`;
	const fileRef = await jsonFileExists(account, model, cacheFileName);
	if (fileRef?.size) {
		const { readStream } = await getJSONFileStream(account, model, cacheFileName);

		await new Promise((resolve) => {
			readStream.on('data', (d) => {
				outStream.write(d);
			});
			readStream.on('end', () => {
				resolve();
			});
			readStream.on('error', (err) => {
				outStream.emit('error', err);
			});
		});
	} else {
		if (fileRef) {
			await removeJSONFile(account, model, cacheFileName);
		}
		const passThruStr = Stream.PassThrough();
		const cacheStream = Stream.PassThrough();

		passThruStr.on('data', (d) => {
			outStream.write(d);
			cacheStream.write(d);
		});
		passThruStr.on('end', () => {
			cacheStream.end();
		});
		passThruStr.on('error', (err) => {
			outStream.emit('error', err);
			cacheStream.emit('error', err);
		});

		await generateSuperMeshMappings(account, model, jsonFiles, passThruStr);
		await storeJSONFileStream(account, model, cacheStream, cacheFileName);
	}
};

const getSuperMeshMappingForModels = async (modelsToProcess, outStream) => {
	const promises = [];

	const getMapping = async (entry, i) => {
		let assetList = await DB.findOne(
			entry.teamspace, `${entry.model}.stash.repobundles`, { _id: entry.rev }, { jsonFiles: 1 });

		if (!assetList) {
			assetList = await DB.findOne(
				entry.teamspace, `${entry.model}.stash.unity3d`, { _id: entry.rev }, { jsonFiles: 1 });
		}

		if (assetList) {
			await addSuperMeshMappingsToStream(
				entry.teamspace, entry.model, entry.rev, assetList.jsonFiles, outStream);
		}

		if (i !== modelsToProcess.length - 1) {
			outStream.write(',');
		}
	};

	for (let i = 0; i < modelsToProcess.length; ++i) {
		const entry = modelsToProcess[i];
		if (entry) {
			promises.push(getMapping(entry, i));
		}
	}

	await Promise.all(promises);
};

JSONAssets.getAllSuperMeshMappingForContainer = async (teamspace, container, branch, rev) => {
	const history = await History.getHistory(teamspace, container, branch, rev, { _id: 1 });
	const modelsToProcess = [{ teamspace, model: container, rev: history._id }];

	const outStream = Stream.PassThrough();

	try {
		getSuperMeshMappingForModels(modelsToProcess, outStream).then(() => {
			// NOTE: this is using a .then because we do not want to wait on this promise - we want to
			// return the stream handler to the client before we start streaming data.

			outStream.end();
		});
	} catch (err) {
		outStream.emit('error', err);
	}

	return { readStream: outStream };
};

JSONAssets.getAllSuperMeshMappingForFederation = async (teamspace, federation, branch, rev) => {
	const subModelRefs = await getRefNodes(teamspace, federation, branch, rev);

	const getSubModelInfoProms = subModelRefs.map(async ({ owner, project }) => {
		const revNode = await History.findLatest(owner, project, { _id: 1 });
		if (revNode) {
			return { teamspace: owner, model: project, rev: revNode._id };
		}
		return undefined;
	});

	const modelsToProcess = await Promise.all(getSubModelInfoProms);

	const outStream = Stream.PassThrough();
	outStream.write('{"submodels":[');

	try {
		getSuperMeshMappingForModels(modelsToProcess, outStream).then(() => {
			// NOTE: this is using a .then because we do not want to wait on this promise - we want to
			// return the stream handler to the client before we start streaming data.
			outStream.write(']}');
			outStream.end();
		});
	} catch (err) {
		outStream.emit('error', err);
	}

	return { readStream: outStream };
};

module.exports = JSONAssets;
