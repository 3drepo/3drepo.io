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
/* istanbul ignore file */
const DB = require('../handler/db');

const DbConstants = require('../handler/db.constants');
const FilesManager = require('../services/filesManager');
const History = require('./history');
const Permissions = require('../utils/permissions/permissions');
const Ref = require('./ref');
const Stream = require('stream');
const jsonAssetsConstants = require('./jsonAssets.constants');
const uuidHelper = require('../utils/helper/uuids');

const JSONAssets = {};

const getJSONCollection = (model) => `${model}${jsonAssetsConstants.JSON_FILE_REF_EXT}`;

const getJSONFileStream = async (teamspace, model, fileName) => {
	const collection = getJSONCollection(model);
	const stream = await FilesManager.getFileAsStream(teamspace, collection, fileName);
	stream.mimeType = 'application/json';
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
			if (file.readStream) {
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

const getFileFromRef = async (teamspace, project, ref, username, filename) => {
	const modelId = ref.project;

	const granted = await Permissions.hasReadAccessToContainer(teamspace, project, modelId, username, true);

	if (granted) {
		// eslint-disable-next-line no-underscore-dangle
		let revId = ref._rid;
		const revIdStr = uuidHelper.UUIDToString(revId);
		if (revIdStr === DbConstants.MASTER_BRANCH) {
			const history = await History.findLatest(ref.owner, modelId, { _id: 1 });
			revId = history ? history._id : undefined;
		}

		if (revId) {
			const revision = uuidHelper.UUIDToString(revId);
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
	const subModelRefs = await Ref.getRefNodes(teamspace, model, branch, revision);

	const getFileProm = [];
	subModelRefs.forEach((ref) => {
		// Ignore failures from submodel fetches.
		getFileProm.push(getFileFromRef(teamspace, project, ref, username, filename)
			.catch(() => Promise.resolve()));
	});

	const fileStreams = await Promise.all(getFileProm);

	return fileStreams.filter((stream) => stream);
};

const calculateStringLength = (str) => Buffer.byteLength(str, 'utf8');

const getHelperJSONFile = async (teamspace,
	project, model, branch, rev, username, filename, prefix, isFed, defaultValues) => {
	const history = await History.getHistory(teamspace, model, branch, rev);

	const revId = uuidHelper.UUIDToString(history._id);
	const treeFileName = `${revId}/${filename}.json`;

	let treeFile;
	try {
		treeFile = await getJSONFileStream(teamspace, model, treeFileName);
	} catch {
		const fakeStream = Stream.PassThrough();
		const fakeContent = JSON.stringify(defaultValues);
		fakeStream.write(fakeContent);
		fakeStream.end();

		const fakeFile = {
			readStream: fakeStream,
			size: calculateStringLength(fakeContent),
			mimeType: 'application/json',
			filename: treeFileName,
		};

		return fakeFile;
	}

	const outStream = Stream.PassThrough();

	let finalSize = 0;

	outStream.write('{');
	finalSize++;

	const treeStream = treeFile.readStream;

	finalSize += await new Promise((resolve) => {
		let streamSize = 0;
		if (treeStream) {
			const prefixStr = `"${prefix}":`;
			outStream.write(prefixStr);
			streamSize += calculateStringLength(prefixStr);

			treeStream.on('data', (d) => {
				outStream.write(d);
				streamSize += d.length;
			});
			treeStream.on('end', () => resolve(streamSize));
		} else {
			let fakeContent = JSON.stringify(defaultValues);
			fakeContent = fakeContent.slice(1, fakeContent.length - 1);
			outStream.write(fakeContent);
			resolve(calculateStringLength(fakeContent));
		}
	});

	if (isFed) {
		const fileStreams = await getFileFromSubModels(teamspace, project, model, branch, rev, username, `${filename}.json`);

		const submodelPrefix = ',"subModels":[';
		outStream.write(submodelPrefix);
		finalSize += calculateStringLength(submodelPrefix);

		// Create promises
		const filePromises = [];
		for (let i = 0; i < fileStreams.length; i++) {
			const file = fileStreams[i];
			const fileStream = file.readStream;

			if (fileStream) {
				const promise = new Promise((resolve) => {
					let streamSize = 0;
					let first = true;

					fileStream.on('data', (d) => {
						if (first) {
							const header = `${(i > 0) ? ',' : ''}{"account":"${file.account}","model":"${file.model}",`;
							const slice = d.slice(1);

							outStream.write(header);
							outStream.write(slice);

							streamSize += calculateStringLength(header);
							streamSize += slice.length;

							first = false;
						} else {
							outStream.write(d);
							streamSize += d.length;
						}
					});
					fileStream.on('end', () => resolve(streamSize));
				});

				filePromises.push(promise);
			}
		}

		// Execute promises
		for (let i = 0; i < filePromises.length; i++) {
			const promise = filePromises[i];

			// We want to await them sequentially to not mix the streams
			// eslint-disable-next-line no-await-in-loop
			const test = await promise;
			finalSize += test;
		}

		outStream.write(']');
		finalSize++;
	}

	outStream.write('}');
	finalSize++;
	outStream.end();

	const outFile = {
		readStream: outStream,
		size: finalSize,
		mimeType: treeFile.mimeType,
		encoding: treeFile.encoding,
		filename,
	};

	return outFile;
};

JSONAssets.getAllSuperMeshMappingForContainer = async (teamspace, container, branch, rev) => {
	const history = await History.getHistory(teamspace, container, branch, rev, { _id: 1 });
	const modelsToProcess = [{ teamspace, model: container, rev: history._id }];

	const outStream = Stream.PassThrough();

	getSuperMeshMappingForModels(modelsToProcess, outStream).then(() => {
		// NOTE: this is using a .then because we do not want to wait on this promise - we want to
		// return the stream handler to the client before we start streaming data.

		outStream.end();
	}).catch((err) => {
		outStream.emit('error', err);
	});

	return { readStream: outStream };
};

JSONAssets.getAllSuperMeshMappingForFederation = async (teamspace, federation, branch, rev) => {
	const subModelRefs = await Ref.getRefNodes(teamspace, federation, branch, rev);

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

	getSuperMeshMappingForModels(modelsToProcess, outStream).then(() => {
		// NOTE: this is using a .then because we do not want to wait on this promise - we want to
		// return the stream handler to the client before we start streaming data.
		outStream.write(']}');
		outStream.end();
	}).catch((err) => {
		outStream.emit('error', err);
	});

	return { readStream: outStream };
};

JSONAssets.getModelProperties = async (
	teamspace, project, model, branch, rev, username, isFed) => {
	const jsonFile = await getHelperJSONFile(
		teamspace,
		project,
		model,
		branch,
		rev,
		username,
		'modelProperties',
		'properties',
		isFed,
		{ hiddenNodes: [] },
	);
	return jsonFile;
};

module.exports = JSONAssets;
