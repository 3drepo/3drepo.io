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
const ModelSetting = require("./modelSetting");
const DB = require("../handler/db");
const utils = require("../utils");
const C = require("../constants");
const { hasReadAccessToModelHelper } = require("../middlewares/checkPermissions");
const Stream = require("stream");
const uuidv5 = require("uuid").v5;

const JSONAssets = {};

async function getSubTreeInfo(federation) {
	const subTreeInfo = [];
	federation.subModels.forEach(({_id, node_id}) => {
		const prom = History.findLatest(federation.teamspace, _id, {_id: 1}).then((rev) => ({
			_id: node_id,
			rid: rev ? utils.uuidToString(rev._id) : C.MASTER_BRANCH,
			teamspace: federation.teamspace,
			model: _id
		}));
		subTreeInfo.push(prom);
	});
	return Promise.all(subTreeInfo);
}

async function appendSubModelFiles(federation, outStream, username, filename) {

	let hasFirstEntry = false;
	for(const container of federation.subModels) {
		if(container) {
			const model = container._id;
			const account = federation.teamspace;

			const granted = await hasReadAccessToModelHelper(username, account, model);
			if(!granted) {
				continue;
			}

			const revision = await History.findLatest(account, model, {_id: 1});
			if(revision) {
				const revisionString = utils.uuidToString(revision._id);
				const fullFileName = `${revisionString}/${filename}`;
				try {
					const fileStream = await FileRef.getJSONFileStream(account, model, fullFileName);
					if(hasFirstEntry) {
						outStream.write(",");
					}
					hasFirstEntry = true;
					await new Promise((resolve) => {
						let first = true;
						fileStream.readStream.on("data", d => {
							if(first) {
								outStream.write(
									"{\"account\":\"" + account +
									"\",\"model\":\"" + model +
									"\",");
								outStream.write(d.slice(1));
								first = false;
							} else {
								outStream.write(d);
							}
						});
						fileStream.readStream.on("end", ()=> resolve());
						fileStream.readStream.on("error", err => outStream.emit("error", err));
					});
				} catch {
					// By convention, subModel fetch failures should be ignored.
				}
			}
		}
	}
}

async function getHelperJSONFile(account, model, branch, rev, username, filename, generateFederationResponse, prefix = "mainTree", allowNotFound, defaultValues = {}) {

	const settings = await ModelSetting.findModelSettingById(account, model);

	const isFed = settings.federate;
	const outStream = Stream.PassThrough();

	settings.teamspace = account;

	try {
		outStream.write(`{"${prefix}": `);

		if (isFed) {
			const fedTree = generateFederationResponse(settings);
			outStream.write(JSON.stringify(fedTree));
		} else {
			const history = await History.getHistory(account, model, branch, rev);
			const revId = utils.uuidToString(history._id);
			const treeFileName = `${revId}/${filename}.json`;

			try {
				const file = await FileRef.getJSONFileStream(account, model, treeFileName);
				const readStream = file.readStream;

				await new Promise((resolve) => {
					readStream.on("data", d => outStream.write(d));
					readStream.on("end", ()=> resolve());
					readStream.on("error", err => outStream.emit("error", err));
				});
			} catch {
				if (allowNotFound) {
					outStream.write(JSON.stringify(defaultValues));
				}
			}
		}

		outStream.write(", \"subModels\":[");

		await appendSubModelFiles(settings, outStream, username, `${filename}.json`);

		outStream.write("]}");
		outStream.end();
	} catch(err) {
		outStream.emit("error", err);
		outStream.end();
	}

	return {
		readStream: outStream
	};
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
	modelsToProcess = modelsToProcess.filter(Boolean); // Remove any falsy values so they'll be ignored when building the array
	for(let i = 0; i < modelsToProcess.length; ++i) {
		const entry = modelsToProcess[i];
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
};

JSONAssets.getAllSuperMeshMapping = async (account, model, branch, rev) => {

	const settings = await ModelSetting.findModelSettingById(account, model);
	const isFed = settings.federate;
	settings.teamspace = account;

	let modelsToProcess;

	if(isFed) {
		const getSubModelInfoProms = settings.subModels.map(async ({_id}) => {
			const revNode = await History.findLatest(account, _id, {_id: 1});
			if(revNode) {
				return {account, model: _id, rev: revNode._id};
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

function generateFullTreeForFederation(federation) {

	const response = {
		nodes: {
			account: federation.teamspace,
			project: federation._id,
			name: federation.name,
			path: federation.node_id,
			_id: federation.node_id,
			shared_id: federation.node_shared_id,
			type: "transformation",
			children: []
		},
		idToName: {
		}
	};

	response.idToName[federation.node_id] = federation.name;

	for (const subModel of federation.subModels) {

		// Take care below that the _id and shared_id are the identifiers of the
		// synthethic tree node; the uuid of the Container is the *name* of the
		// tree node, and is stored in the subModel._id.

		response.nodes.children.push({
			account: federation.teamspace,
			project: federation._id,
			type: "ref",
			name: subModel._id,
			path: `${federation.node_id}__${subModel.node_id}`,
			_id: subModel.node_id,
			shared_id: subModel.node_shared_id,
			toggleState: "visible"
		});

		response.idToName[subModel.node_id] = subModel._id;
	}

	return response;
}

function generateTreeNodeIdsForFederation(settings) {
	// The frontend tree presents the entire scene as one graph, where each node
	// has a unique _id and shared_id. These ids may be stored and so are expected
	// to be consistent between loads of a federation, though may change between
	// federation revisions.

	// To synthesize uuids that maintain these properties, we combine the Container,
	// Federation ids and timestamp in a deterministic hash.

	// The tree expects a root node (a transformation for the federation itself),
	// as well as nodes for each Container (if any).

	settings.node_id = uuidv5(settings.teamspace, settings._id);
	settings.node_shared_id = uuidv5("shared", settings.node_id);
	if(settings.subModels) {
		for (const container of settings.subModels) {
			container.node_id = uuidv5(container._id, settings._id);
			container.node_shared_id = uuidv5("shared", container.node_id);
		}
	}
}

JSONAssets.getTree = async function(account, model, branch, rev) {

	const settings = await ModelSetting.findModelSettingById(account, model);

	const isFed = settings.federate;
	const outStream = Stream.PassThrough();

	// Annotate the settings object with additional properties to make it match
	// the federation object schema.

	settings.teamspace = account;

	generateTreeNodeIdsForFederation(settings);

	try {
		outStream.write("{\"mainTree\": ");

		if (isFed) {
			const fedTree = generateFullTreeForFederation(settings);
			outStream.write(JSON.stringify(fedTree));
		} else {
			const history = await History.getHistory(account, model, branch, rev);
			const revId = utils.uuidToString(history._id);
			const treeFileName = `${revId}/fulltree.json`;
			const file = await FileRef.getJSONFileStream(account, model, treeFileName);
			const readStream = file.readStream;

			await new Promise((resolve) => {
				readStream.on("data", d => outStream.write(d));
				readStream.on("end", ()=> resolve());
				readStream.on("error", err => outStream.emit("error", err));
			});
		}

		outStream.write(", \"subTrees\":[");

		if(isFed) {
			const subTreeInfo = await getSubTreeInfo(settings);
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
		}

		outStream.write("]}");
		outStream.end();
	} catch(err) {
		outStream.emit("error", err);
		outStream.end();
	}

	return {
		file: {
			readStream: outStream
		},
		isFed
	};
};

function getFederationModelProperties(settings) {
	return { hiddenNodes: [] };
}

function getFederationIdMap(settings) {
	return {};
}

function getFederationIdToMeshes(settings) {
	return {};
}

function getFederationTreePath(settings) {
	generateTreeNodeIdsForFederation(settings);
	const idToPath = {};
	for (const container of settings.subModels) {
		idToPath[container.node_id] = `${settings.node_id}__${container.node_id}`;
	}
	idToPath[settings.node_id] = settings.node_id;
	return {
		idToPath
	};
}

JSONAssets.getModelProperties = function(account, model, branch, rev, username) {
	return getHelperJSONFile(account, model, branch, rev, username, "modelProperties", getFederationModelProperties, "properties", true, {hiddenNodes: []});
};

JSONAssets.getIdMap = function(account, model, branch, rev, username) {
	return getHelperJSONFile(account, model, branch, rev, username, "idMap", getFederationIdMap);
};

JSONAssets.getIdToMeshes = function(account, model, branch, rev, username) {
	return getHelperJSONFile(account, model, branch, rev, username, "idToMeshes", getFederationIdToMeshes);
};

JSONAssets.getTreePath = function(account, model, branch, rev, username) {
	return getHelperJSONFile(account, model, branch, rev, username, "tree_path", getFederationTreePath);
};

module.exports = JSONAssets;
