/**
 *  Copyright (C) 2018 3D Repo Ltd
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
const utils = require("../utils");
const Ref = require("./ref");
const C = require("../constants");
const Middlewares = require("../middlewares/middlewares");
const ResponseCodes = require("../response_codes");
const Stream = require("stream");

const JSONAssets = {};

async function getSubTreeInfo(account, model, currentIds) {
	const subModelRefs = await Ref.getRefNodes(account, model, currentIds);
	const subTreeInfo = [];
	subModelRefs.forEach((ref) => {
		const prom = History.findLatest({account: ref.owner, model: ref.project}, {_id: 1}).then((rev) => ({
			_id: utils.uuidToString(ref._id),
			rid: utils.uuidToString(rev ? rev._id : ref._rid),
			teamspace:ref.owner,
			model: ref.project
		}));
		subTreeInfo.push(prom);
	});
	return Promise.all(subTreeInfo);
}

function getFileFromSubModels(account, model, currentIds, username, filename) {
	return Ref.getRefNodes(account, model, currentIds).then((subModelRefs) => {
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
	return Middlewares.hasReadAccessToModelHelper(username, ref.owner, ref.project).then((granted) => {
		if(granted) {

			const revId = utils.uuidToString(ref._rid);
			const getRevIdPromise = revId === C.MASTER_BRANCH ?
				History.findLatest({account: ref.owner, model: ref.project}, {_id: 1}) :
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
	return History.getHistory({ account, model }, branch, rev).then((history) => {
		if(history) {
			const revId = utils.uuidToString(history._id);
			const treeFileName = `${revId}/${filename}.json`;
			let mainTreePromise;
			const subTreesPromise = getFileFromSubModels(account, model, history.current, username, `${filename}.json`);

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
		} else {
			return Promise.reject(ResponseCodes.INVALID_TAG_NAME);
		}
	});
}

JSONAssets.getSuperMeshMapping = function(account, model, id) {
	const name = `${id}.json.mpc`;
	return FileRef.getJSONFile(account, model, name);
};

JSONAssets.getTree = function(account, model, branch, rev) {
	return History.getHistory({ account, model }, branch, rev).then((history) => {
		if(history) {
			const revId = utils.uuidToString(history._id);
			const treeFileName = `${revId}/fulltree.json`;
			const mainTreePromise = FileRef.getJSONFileStream(account, model, treeFileName);
			const subTreesPromise = getSubTreeInfo(account, model, history.current);

			return mainTreePromise.then((file) => {
				const outStream = Stream.PassThrough();
				const readStream = file.readStream;
				file.readStream = outStream;
				delete file.size;
				new Promise(function(resolve) {
					outStream.write("{\"mainTree\": ");
					readStream.on("data", d => outStream.write(d));
					readStream.on("end", ()=> resolve());
					readStream.on("error", err => outStream.emit("error", err));
				}).then(() => {
					return subTreesPromise.then((subTreeInfo) => {
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
					});

				}).catch((err) => {
					outStream.emit("error", err);
					outStream.end();
				});

				return subTreesPromise.then((subTreeInfo) => ({ file, isFed: subTreeInfo.length > 0 })) ;

			});
		} else {
			return Promise.reject(ResponseCodes.INVALID_TAG_NAME);
		}
	});
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
