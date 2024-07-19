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

const FileRef = require("./fileRef");
const History = require("./history");
const DB = require("../handler/db");
const utils = require("../utils");
const { getRefNodes } = require("./ref");
const C = require("../constants");
const { hasReadAccessToModelHelper } = require("../middlewares/checkPermissions");
const Stream = require("stream");

const JSONAssets = {};

async function getSubTreeInfo(account, model, branch, revision) {
	const subModelRefs = await getRefNodes(account, model, branch, revision);
	const subTreeInfo = [];
	subModelRefs.forEach((ref) => {
		const prom = History.findLatest(ref.owner, ref.project, {_id: 1}).then((rev) => ({
			_id: utils.uuidToString(ref._id),
			rid: utils.uuidToString(rev ? rev._id : ref._rid),
			teamspace:ref.owner,
			model: ref.project
		}));
		subTreeInfo.push(prom);
	});
	return Promise.all(subTreeInfo);
}

function getFileFromSubModels(account, model, branch, revision, username, filename) {
	return getRefNodes(account, model, branch, revision).then((subModelRefs) => {
		const getFileProm = [];
		subModelRefs.forEach((ref) => {
			getFileProm.push(getFileFromRef(ref, username, filename).catch(() => {
				// Ignore failures from submodel fetches.
				return Promise.resolve();
			}));
		});

		return Promise.all(getFileProm).then((fileStreams) => {
			return fileStreams.filter((stream) => stream);
		});
	});
}

function getFileFromRef(ref, username, filename) {
	return hasReadAccessToModelHelper(username, ref.owner, ref.project).then((granted) => {
		if(granted) {

			const revId = utils.uuidToString(ref._rid);
			const getRevIdPromise = revId === C.MASTER_BRANCH ?
				History.findLatest(ref.owner, ref.project, {_id: 1}) :
				Promise.resolve({_id : ref._rid});

			return getRevIdPromise.then((revInfo) => {
				if (revInfo) {
					const revision = utils.uuidToString(revInfo._id);
					const fullFileName = `${revision}/${filename}`;
					return FileRef.getJSONFileStream(ref.owner, ref.project, fullFileName).then((fileRef) => {
						fileRef.account = ref.owner;
						fileRef.model = ref.project;
						return fileRef;
					});
				}
			});
		}
	});
}

function appendSubModelFiles(subTreeFiles, outStream) {
	outStream.write("\"subModels\":[");
	let subStreamPromise = Promise.resolve();
	for(let i = 0; i < subTreeFiles.length; ++i) {
		if(subTreeFiles[i]) {
			subStreamPromise = subStreamPromise.then(() => {
				return new Promise(function(resolve) {
					if(i > 0) {
						outStream.write(",");
					}
					let first = true;
					subTreeFiles[i].readStream.on("data", d => {
						if(first) {
							outStream.write("{\"account\":\""
								+ subTreeFiles[i].account + "\",\"model\":\"" + subTreeFiles[i].model + "\",");
							outStream.write(d.slice(1));
							first = false;
						} else {
							outStream.write(d);
						}
					});
					subTreeFiles[i].readStream.on("end", ()=> resolve());
					subTreeFiles[i].readStream.on("error", err => outStream.emit("error", err));
				});
			});
		}
	}
	return subStreamPromise.then(() => {
		outStream.write("]");
	});
}

function getHelperJSONFile(account, model, branch, rev, username, filename, prefix = "mainTree", allowNotFound, defaultValues = {}) {
	return  History.getHistory(account, model, branch, rev).then((history) => {
		const revId = utils.uuidToString(history._id);
		const treeFileName = `${revId}/${filename}.json`;
		let mainTreePromise;
		const subTreesPromise = getFileFromSubModels(account, model, branch, rev, username, `${filename}.json`);

		if (allowNotFound) {
			mainTreePromise = FileRef.getJSONFileStream(account, model, treeFileName).catch(() => {
				const fakeStream = Stream.PassThrough();
				fakeStream.write(JSON.stringify(defaultValues));
				fakeStream.end();
				return { fileName: treeFileName, readStream: fakeStream };
			});
		} else {
			mainTreePromise = FileRef.getJSONFileStream(account, model, treeFileName);
		}

		return mainTreePromise.then((file) => {
			const outStream = Stream.PassThrough();
			const readStream = file.readStream;
			file.readStream = outStream;
			delete file.size;
			new Promise(function(resolve) {
				outStream.write(`{"${prefix}":`);
				if(readStream) {
					readStream.on("data", d => outStream.write(d));
					readStream.on("end", ()=> resolve());
					readStream.on("error", err => outStream.emit("error", err));
				} else {
					resolve();
				}
			}).then(() => {
				return subTreesPromise.then((subTreeFiles) => {
					outStream.write(",");
					return appendSubModelFiles(subTreeFiles, outStream).then(() => {
						outStream.write("}");
						outStream.end();
					});
				});
			}).catch((err) => {
				outStream.emit("error", err);
				outStream.end();
			});

			return file;
		});
	});
}

JSONAssets.getSuperMeshMapping = function(account, model, id) {
	const name = `${id}.json.mpc`;
	return FileRef.getJSONFile(account, model, name);
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
	for(let j = 0; j < fileGroups.length; ++j) {
		const filesToProcess = fileGroups[j];
		const files = await Promise.all(
			filesToProcess.map(async (fileName) => {
				const regexRes = fileName.match(regex);
				return {fileName, file: await FileRef.getJSONFileStream(account, model, regexRes[0])};
			}));

		for(let i = 0; i < files.length; ++i) {
			const {fileName, file} = files[i];

			const regexRes = fileName.match(regex);
			const id = regexRes[1];
			if(file) {
				outStream.write(`{"id":"${id}","data":`);
				const { readStream } = file;

				await new Promise((resolve) => {
					readStream.on("data", d => {
						outStream.write(d);
					});
					readStream.on("end", ()=> {
						resolve();
					});
					readStream.on("error", err => {
						outStream.emit("error", err);
					});
				});

				const eofStr = `}${fileName !== jsonFiles[jsonFiles.length - 1] ? "," : "" }`;
				outStream.write(eofStr);
			}
		}
	}

	const endingStr = "]}";
	outStream.write(endingStr);
	outStream.end();

};

const addSuperMeshMappingsToStream = async (account, model, revId, jsonFiles, outStream) => {
	const cacheFileName = `${utils.uuidToString(revId)}/supermeshes.json`;
	const fileRef = await FileRef.jsonFileExists(account, model, cacheFileName);
	if(fileRef?.size) {
		const { readStream } = await FileRef.getJSONFileStream(account, model, cacheFileName);

		await new Promise((resolve) => {
			readStream.on("data", d => {
				outStream.write(d);
			});
			readStream.on("end", ()=> {
				resolve();
			});
			readStream.on("error", err => {
				outStream.emit("error", err);
			});
		});
	} else {

		if(fileRef) {
			await FileRef.removeJSONFile(account, model, cacheFileName);
		}
		const passThruStr = Stream.PassThrough();
		const cacheStream = Stream.PassThrough();

		const cacheWriteProm = FileRef.storeJSONFileStream(account, model, cacheStream, undefined, cacheFileName);

		passThruStr.on("data", d => {
			outStream.write(d);
			cacheStream.write(d);
		});
		passThruStr.on("end", ()=> {
			cacheStream.end();
		});
		passThruStr.on("error", err => {
			outStream.emit("error", err);
			cacheStream.emit("error", err);
		});


		await generateSuperMeshMappings(account, model, jsonFiles, passThruStr);
		await cacheWriteProm;

	}

};

const getSuperMeshMappingForModels = async (modelsToProcess, outStream) => {

	for(let i = 0; i < modelsToProcess.length; ++i) {
		const entry = modelsToProcess[i];
		if(entry) {

			let assetList = await DB.findOne(
				entry.account, `${entry.model}.stash.repobundles`, {_id: entry.rev}, {jsonFiles: 1});

			if(!assetList) {
				assetList = await DB.findOne(
					entry.account, `${entry.model}.stash.unity3d`, {_id: entry.rev}, {jsonFiles: 1});
			}

			if(assetList) {
				await addSuperMeshMappingsToStream(entry.account, entry.model, entry.rev, assetList.jsonFiles, outStream);
			}

			if(i !== modelsToProcess.length - 1) {
				outStream.write(",");
			}
		}
	}
};

JSONAssets.getAllSuperMeshMapping = async (account, model, branch, rev) => {
	let modelsToProcess;

	const subModelRefs = await getRefNodes(account, model, branch, rev);

	const isFed = subModelRefs.length;

	if(isFed) {
		const getSubModelInfoProms = subModelRefs.map(async ({owner, project}) => {
			const revNode = await History.findLatest(owner, project, {_id: 1});
			if(revNode) {
				return {account: owner, model: project, rev: revNode._id};
			}
		});
		modelsToProcess = await Promise.all(getSubModelInfoProms);
	} else {
		const history = await History.getHistory(account, model, branch, rev, {_id: 1});
		modelsToProcess = [{account, model, rev: history._id}];
	}

	const outStream = Stream.PassThrough();

	if(isFed) {
		outStream.write("{\"submodels\":[");
	}
	getSuperMeshMappingForModels(modelsToProcess, outStream).then(() => {
		// NOTE: this is using a .then because we do not want to wait on this promise - we want to
		// return the stream handler to the client before we start streaming data.
		if(isFed) {
			outStream.write("]}");
		}
		outStream.end();
	}).catch((err) => outStream.emit("error", err));

	return { readStream: outStream, isFed};

};

JSONAssets.getTree = async function(account, model, branch, rev) {
	const history = await History.getHistory(account, model, branch, rev);
	const revId = utils.uuidToString(history._id);
	const treeFileName = `${revId}/fulltree.json`;

	const file = await FileRef.getJSONFileStream(account, model, treeFileName);

	let isFed = false;
	const outStream = Stream.PassThrough();
	const readStream = file.readStream;
	file.readStream = outStream;
	delete file.size;

	try {
		await new Promise((resolve) => {
			outStream.write("{\"mainTree\": ");
			readStream.on("data", d => outStream.write(d));
			readStream.on("end", ()=> resolve());
			readStream.on("error", err => outStream.emit("error", err));
		});

		const subTreeInfo =  await getSubTreeInfo(account, model, branch, rev);
		isFed = subTreeInfo.length > 0;

		outStream.write(", \"subTrees\":[");
		for(let i = 0; i < subTreeInfo.length; ++i) {
			if(subTreeInfo[i]) {
				if(i > 0) {
					outStream.write(",");
				}
				const url = subTreeInfo[i].rid !== C.MASTER_BRANCH ?
					`/${subTreeInfo[i].teamspace}/${subTreeInfo[i].model}/revision/${subTreeInfo[i].rid}/fulltree.json` :
					`/${subTreeInfo[i].teamspace}/${subTreeInfo[i].model}/revision/master/head/fulltree.json`;
				subTreeInfo[i].url = url;
				outStream.write(JSON.stringify(subTreeInfo[i]));
			}
		}
		outStream.write("]}");
		outStream.end();
	} catch(err) {
		outStream.emit("error", err);
		outStream.end();
	}

	return { file, isFed };
};

JSONAssets.getModelProperties = function(account, model, branch, rev, username) {
	return getHelperJSONFile(account, model, branch, rev, username, "modelProperties", "properties", true, {hiddenNodes: []});
};

JSONAssets.getIdMap = function(account, model, branch, rev, username) {
	return getHelperJSONFile(account, model, branch, rev, username, "idMap");
};

JSONAssets.getIdToMeshes = function(account, model, branch, rev, username) {
	return getHelperJSONFile(account, model, branch, rev, username, "idToMeshes");
};

JSONAssets.getTreePath = function(account, model, branch, rev, username) {
	return getHelperJSONFile(account, model, branch, rev, username, "tree_path");
};

module.exports = JSONAssets;
