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

const DbConstants = require('../handler/db.constants');
const FilesManager = require('../services/filesManager');
const History = require('./history');
const ModelSettings = require('./modelSettings');
const Permissions = require('../utils/permissions/permissions');
const Scene = require('./scenes');
const Stream = require('stream');
const jsonAssetsConstants = require('./jsonAssets.constants');
const uuidHelper = require('../utils/helper/uuids');

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

const generateSuperMeshMappings = async (teamspace, model, jsonFiles, outStream) => {
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
				return { fileName, file: await getJSONFileStream(teamspace, model, regexRes[0]) };
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

const addSuperMeshMappingsToStream = async (teamspace, model, revId, jsonFiles, outStream) => {
	const cacheFileName = `${uuidHelper.UUIDToString(revId)}/supermeshes.json`;
	const fileRef = await jsonFileExists(teamspace, model, cacheFileName);
	if (fileRef?.size) {
		const { readStream } = await getJSONFileStream(teamspace, model, cacheFileName);

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
			await removeJSONFile(teamspace, model, cacheFileName);
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

		await generateSuperMeshMappings(teamspace, model, jsonFiles, passThruStr);
		await storeJSONFileStream(teamspace, model, cacheStream, cacheFileName);
	}
};

const getSuperMeshMappingForEntry = async (entry, index, outStream) => {
	let assetList = await DB.findOne(
		entry.teamspace, `${entry.model}.stash.repobundles`, { _id: entry.rev }, { jsonFiles: 1 });

	if (!assetList) {
		assetList = await DB.findOne(
			entry.teamspace, `${entry.model}.stash.unity3d`, { _id: entry.rev }, { jsonFiles: 1 });
	}

	if (assetList) {
		if (index !== 0) {
			outStream.write(',');
		}

		await addSuperMeshMappingsToStream(
			entry.teamspace, entry.model, entry.rev, assetList.jsonFiles, outStream);
	}
};

const getSuperMeshMappingForModels = async (modelsToProcess, outStream) => {
	for (let i = 0; i < modelsToProcess.length; ++i) {
		const entry = modelsToProcess[i];
		if (entry) {
			// Ignore necessary to avoid writing to the stream in parallel.
			// eslint-disable-next-line no-await-in-loop
			await getSuperMeshMappingForEntry(entry, i, outStream);
		}
	}
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

const appendSubModelFiles = (subTreeFiles, outStream) => {
	outStream.write('"subModels":[');
	let subStreamPromise = Promise.resolve();
	for (let i = 0; i < subTreeFiles.length; ++i) {
		if (subTreeFiles[i]) {
			subStreamPromise = subStreamPromise.then(() => new Promise((resolve) => {
				if (i > 0) {
					outStream.write(',');
				}
				let first = true;
				subTreeFiles[i].readStream.on('data', (d) => {
					if (first) {
						outStream.write(`{"account":"${
							subTreeFiles[i].account}","model":"${subTreeFiles[i].model}",`);
						outStream.write(d.slice(1));
						first = false;
					} else {
						outStream.write(d);
					}
				});
				subTreeFiles[i].readStream.on('end', () => resolve());
				subTreeFiles[i].readStream.on('error', (err) => outStream.emit('error', err));
			}));
		}
	}
	return subStreamPromise.then(() => {
		outStream.write(']');
	});
};

const getFileFromRef = async (teamspace, project, ref, username, filename) => {
	const modelId = ref.project;

	const granted = await Permissions.hasReadAccessToContainer(teamspace, project, modelId, username, true);

	if (granted) {
		// eslint-disable-next-line no-underscore-dangle
		let revId = uuidHelper.UUIDToString(ref._rid);
		if (revId === DbConstants.MASTER_BRANCH) {
			revId = await History.findLatest(ref.owner, modelId, { _id: 1 });
		}

		if (revId) {
			const revision = uuidHelper.UUIDToString(revId._id);
			const fullFileName = `${revision}/${filename}`;

			const fileRef = await getJSONFileStream(ref.owner, modelId, fullFileName);
			fileRef.account = ref.owner;
			fileRef.model = modelId;
			return fileRef;
		}
	}
	return undefined;
};

const getFileFromSubModels = async (teamspace, project, model, branch, revision, username, filename) => {
	const subModelRefs = await getRefNodes(teamspace, model, branch, revision);

	const getFileProm = [];
	subModelRefs.forEach((ref) => {
		// Ignore failures from submodel fetches.
		getFileProm.push(getFileFromRef(teamspace, project, ref, username, filename)
			.catch(() => Promise.resolve()));
	});

	const fileStreams = await Promise.all(getFileProm);

	return fileStreams.filter((stream) => stream);
};

const getHelperJSONFile = async (teamspace, project, model, branch, rev, username, filename, prefix = 'mainTree', isFed, allowNotFound, defaultValues = {}) => {
	const history = await History.getHistory(teamspace, model, branch, rev);

	const revId = uuidHelper.UUIDToString(history._id);
	const treeFileName = `${revId}/${filename}.json`;
	let mainTreePromise;

	if (allowNotFound) {
		try {
			mainTreePromise = getJSONFileStream(teamspace, model, treeFileName);
		} catch {
			const fakeStream = Stream.PassThrough();
			fakeStream.write(JSON.stringify(defaultValues));
			fakeStream.end();
			return { fileName: treeFileName, readStream: fakeStream };
		}
	} else {
		mainTreePromise = getJSONFileStream(teamspace, model, treeFileName);
	}

	const file = await mainTreePromise;

	const outStream = Stream.PassThrough();
	const { readStream } = file;
	file.readStream = outStream;
	delete file.size;

	try {
		await new Promise((resolve) => {
			outStream.write(`{"${prefix}":`);
			if (readStream) {
				readStream.on('data', (d) => outStream.write(d));
				readStream.on('end', () => resolve());
				readStream.on('error', (err) => outStream.emit('error', err));
			} else {
				resolve();
			}
		});

		if (isFed) {
			const subTreesPromise = getFileFromSubModels(teamspace, project, model, branch, rev, username, `${filename}.json`);
			const subTreeFiles = await subTreesPromise;
			outStream.write(',');
			await appendSubModelFiles(subTreeFiles, outStream);
		}

		outStream.write('}');
		outStream.end();
	} catch (err) {
		outStream.emit('error', err);
		outStream.end();
	}

	return file;
};

JSONAssets.getModelProperties = (teamspace, project, model, branch, rev, username, isFed) => getHelperJSONFile(
	teamspace,
	project,
	model,
	branch,
	rev,
	username,
	'modelProperties',
	'properties',
	isFed,
	true,
	{ hiddenNodes: [] },
);

module.exports = JSONAssets;
