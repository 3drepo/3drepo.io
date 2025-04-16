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

const {
	prepareDefaultView,
	createNewSetting,
	findModelSettingById,
	findModelSettings,
	findPermissionByUser,
	getModelsData,
	isModelNameExists,
	setModelStatus,
	createCorrelationId
} = require("../modelSetting");
const responseCodes = require("../../response_codes");
const importQueue = require("../../services/queue");
const C = require("../../constants");
const systemLogger = require("../../logger.js").systemLogger;
const History = require("../history");
const { getRefNodes } = require("../ref");
const { findNodesByType, getNodeById, getParentMatrix } = require("../scene");
const utils = require("../../utils");
const middlewares = require("../../middlewares/middlewares");
const ChatEvent = require("../chatEvent");
const { addModelToProject, findOneProject } = require("../project");
const { getTeamspaceSettings } = require("../teamspaceSetting");
const _ = require("lodash");
const FileRef = require("../fileRef");
const CombinedStream = require("combined-stream");
const stringToStream = require("string-to-stream");
const { BinToFaceStringStream, BinToVector3dStringStream } = require("./binary");
const PermissionTemplates = require("../permissionTemplates");
const AccountPermissions = require("../accountPermissions");

const {v5Path} = require("../../../interop");
const { deleteModel } = require(`${v5Path}/processors/teamspaces/projects/models/commons/modelList`);

async function _fillInModelDetails(accountName, setting, permissions) {
	if (permissions.indexOf(C.PERM_MANAGE_MODEL_PERMISSION) !== -1) {
		permissions = C.MODEL_PERM_LIST.slice(0);
	}

	const model = {
		federate: setting.federate,
		permissions: permissions,
		model: setting._id,
		type: setting.type,
		units: setting.properties.unit,
		name: setting.name,
		status: setting.status,
		errorReason: setting.errorReason,
		subModels: setting.federate && setting.subModels || undefined,
		timestamp: setting.timestamp || null,
		code: setting.properties ? setting.properties.code || undefined : undefined

	};

	const nRev = await History.revisionCount(accountName, setting._id);

	model.nRevisions = nRev;

	return model;
}

// list all models in an account
async function _getModels(teamspace, ids, permissions) {
	const models = [];
	const fedModels = [];

	let query = {};

	if (ids) {
		query = { _id: { "$in": ids } };
	}

	const settings = await findModelSettings(teamspace, query);

	await Promise.all(settings.map(async setting => {
		const model = await _fillInModelDetails(teamspace, setting, permissions);

		if (!(model.permissions.length === 1 && model.permissions[0] === null)) {
			setting.federate ? fedModels.push(model) : models.push(model);
		}
	}));

	return { models, fedModels };
}

function _makeAccountObject(name) {
	return { account: name, models: [], fedModels: [], projects: [], permissions: [], isAdmin: false };
}

/**
 * Create correlation ID, store it in model setting, and return it
 * @param {account} account - User account
 * @param {model} model - Model
 * @param {user} user - The user who triggered the status
 */
async function setStatus(account, model, status, user) {
	try {
		const setting = await setModelStatus(account, model, status);
		systemLogger.logDebug(`Model status changed to ${status}`);
		ChatEvent.modelStatusChanged(null, account, model, { status, user });

		return setting;
	} catch(err) {
		systemLogger.logError("Failed to invoke setStatus:", err);
	}
}

function createNewModel(teamspace, modelName, data) {
	if(!utils.hasField(data, "project")) {
		return Promise.reject(responseCodes.PROJECT_NOT_FOUND);
	}

	const projectName = data.project;
	return findOneProject(teamspace, {name: projectName}).then((project) => {
		if(!project) {
			return Promise.reject(responseCodes.PROJECT_NOT_FOUND);
		}

		// FIXME when project changes are merged, consider using func in project
		// Check there's no other model within the same project with the model name
		return isModelNameExists(teamspace, project.models, modelName).then((modelNameExists) => {
			if(modelNameExists) {
				return Promise.reject({resCode: responseCodes.MODEL_EXIST});
			}

			// Create a model setting
			return createNewSetting(teamspace, modelName, data).then((settings) => {
				// Add model into project
				return addModelToProject(teamspace, projectName, settings._id).then(() => {
					// call chat to indicate a new model has been created
					const modelData = {
						account: teamspace,
						model:  settings._id,
						name: modelName,
						permissions: C.MODEL_PERM_LIST,
						timestamp: undefined,
						projectName
					};

					ChatEvent.newModel(data.sessionId, teamspace, modelData);
					return {modelData, settings};
				});
			});

		});
	});
}

function createNewFederation(teamspace, modelName, username, data, toyFed) {
	return createNewModel(teamspace, modelName, data).then((modelInfo) => {
		return createFederatedModel(teamspace, modelInfo.settings._id, username, data.subModels, modelInfo.settings, toyFed).then(() => {
			return modelInfo;
		});
	});
}

function createFederatedModel(account, model, username, subModels, modelSettings, toyFed) {

	const addSubModelsPromise = [];
	const subModelArr = [];

	if(subModels.length === 0) {
		return Promise.resolve();
	}

	subModels.forEach(subModel => {
		if(subModel.database !== account) {

			addSubModelsPromise.push(Promise.reject(responseCodes.FED_MODEL_IN_OTHER_DB));
			return;
		}

		addSubModelsPromise.push(findModelSettingById(account, subModel.model).then(setting => {
			if(!setting) {
				return Promise.reject(responseCodes.MODEL_NOT_FOUND);
			}

			if(setting.federate) {
				return Promise.reject(responseCodes.FED_MODEL_IS_A_FED);

			}

			if(!subModelArr.find(o => o.project === subModel.model)) {
				subModelArr.push({
					database: subModel.database,
					project: subModel.model
				});
			}
		}));

	});

	return Promise.all(addSubModelsPromise).then(() => {
		return createCorrelationId(account, model, true).then(correlationId => {
			setStatus(account, model, "queued", username).then(() => {
				const federatedJSON = {
					database: account,
					project: model,
					subProjects: subModelArr
				};

				if(toyFed) {
					federatedJSON.toyFed = toyFed;
				}

				return importQueue.createFederatedModel(correlationId, account, federatedJSON);
			});
		});
	});

}

function searchTree(account, model, branch, rev, searchString, username) {

	const search = () => {

		let items = [];

		const type = {"$in": ["transformation", "mesh"]};

		return findNodesByType(account, model, branch, rev, type, searchString, { name: 1 }).then(objs => {

			objs.forEach((obj, i) => {

				objs[i] = obj;
				objs[i].account = account;
				objs[i].model = model;
				items.push(objs[i]);

			});

			return getRefNodes(account, model, branch, rev);

		}).then(refs => {

			const promises = [];

			refs.forEach(ref => {

				let refRev, refBranch;

				if(utils.uuidToString(ref._rid) === C.MASTER_BRANCH) {
					refBranch = C.MASTER_BRANCH_NAME;
				} else {
					refRev = utils.uuidToString(ref._rid);
				}

				promises.push(searchTree(ref.owner, ref.project, refBranch, refRev, searchString, username));
			});

			return Promise.all(promises);

		}).then(results => {

			results.forEach(objs => {
				items = items.concat(objs);
			});

			return Promise.resolve(items);

		});
	};

	return middlewares.hasReadAccessToModelHelper(username, account, model).then(granted => {

		if(granted) {

			return  History.getHistory(account, model, branch, rev).then(history => {
				if(history) {
					return search();
				} else {
					return Promise.resolve([]);
				}
			});

		} else {
			return Promise.resolve([]);
		}
	});

}

function listSubModels(account, model, branch = "master") {

	const subModels = [];

	return History.findByBranch(account, model, branch).then(history => {

		if(history) {
			return getRefNodes(account, model, branch);
		} else {
			return [];
		}

	}).then(refs => {

		const proms = refs.map(ref =>

			findModelSettingById(ref.owner, ref.project, { name: 1 }).then(subModel => {
				// TODO: Why would this return null?
				if (subModel) {
					subModels.push({
						database: ref.owner,
						model: ref.project,
						name: subModel.name
					});
				}

			})

		);

		return Promise.all(proms).then(() => Promise.resolve(subModels));

	});
}

function downloadLatest(account, model) {
	return History.findLatest(account, model, {rFile: 1}).then((fileEntry) => {
		if(!fileEntry || !fileEntry.rFile || !fileEntry.rFile.length) {
			return Promise.reject(responseCodes.NO_FILE_FOUND);
		}

		// We currently only support single file fetches
		const fileName = fileEntry.rFile[0];
		const filePromise = FileRef.getOriginalFile(account, model, fileName);

		const fileNameArr = fileName.split("_");
		const ext = fileNameArr.length > 1 ? "." + fileNameArr.pop() : "";

		const fileNameFormatted = fileNameArr.join("_").substr(36) + ext;

		return filePromise.then((file) => {
			file.fileName = fileNameFormatted;
			return file;
		});
	});
}

/**
 * Called by importModel to perform model upload
 */
async function _handleUpload(correlationId, account, model, username, file, data) {
	const newFileName = file.originalname.replace(C.FILENAME_REGEXP, "_");

	await importQueue.writeImportData(correlationId,
		account,
		model,
		username,
		newFileName,
		data.tag,
		data.desc,
		data.importAnimations
	);

	return importQueue.importFile(
		correlationId,
		file.path,
		newFileName,
		null
	);
}

function importModel(account, model, username, modelSetting, source, data) {

	if(!modelSetting) {
		return Promise.reject({ message: `modelSetting is ${modelSetting}`});
	}

	return createCorrelationId(account, model).then(correlationId => {
		return setStatus(account, model, "queued", username).then(setting => {

			modelSetting = setting;

			if (source.type === "upload") {
				return _handleUpload(correlationId, account, model, username, source.file, data);

			}

		});
	}).catch(err => {
		systemLogger.logError("Failed to importModel:", err);
		return Promise.reject(err);
	});

}

async function isSubModel(account, model) {
	const query = { "subModels._id": model };

	return (await findModelSettings(account, query)).length > 0;
}

function removeModel(account, model, forceRemove, projectId) {
	return findModelSettingById(account, model).then((setting) => {
		if (!setting) {
			return Promise.reject(responseCodes.MODEL_NOT_FOUND);
		}

		let subModelCheckPromise;
		if (!forceRemove && !setting.federate) {
			subModelCheckPromise = isSubModel(account, model);

		} else {
			subModelCheckPromise = Promise.resolve(false);
		}

		return subModelCheckPromise.then(async (isSub) => {
			if (isSub) {
				throw responseCodes.MODEL_IS_A_SUBMODEL;
			}

			if(!projectId) {
				projectId = (await findOneProject(account, {models: model}, {_id: 1}))._id;
			}

			await deleteModel(account, projectId, model).catch((err) => {
				systemLogger.logError("Failed to remove collections: ", err);
				return Promise.reject(responseCodes.REMOVE_MODEL_FAILED);
			});
			return {...setting, account, model};
		});
	});
}

const flattenPermissions = (permissions, defaultToPermissionDefinition = false) => {
	if (!permissions) {
		return [];
	}

	return _.compact(_.flatten(permissions.map(p => C.IMPLIED_PERM[p] && C.IMPLIED_PERM[p].model || (defaultToPermissionDefinition ? p : null))));
};

async function getModelPermission(username, setting, account) {
	if(!setting) {
		return [];
	}

	try {
		let permissions = [];
		const dbUser = await getTeamspaceSettings(account);
		if(!dbUser) {
			return [];
		}

		const accountPerm = AccountPermissions.findByUser(dbUser, username);
		if(accountPerm && accountPerm.permissions) {
			permissions = flattenPermissions(accountPerm.permissions);
		}

		const projectQuery = { models: setting._id, "permissions.user": username };

		// project admin have access to models underneath it.
		const project = await findOneProject(account, projectQuery, { "permissions.$" : 1 });

		if(project && project.permissions) {
			permissions = permissions.concat(flattenPermissions(project.permissions[0].permissions));
		}

		const template = await findPermissionByUser(account, setting._id, username);

		if(template) {
			const permissionTemplate = PermissionTemplates.findById(template.permission);

			if(permissionTemplate && permissionTemplate.permissions) {
				permissions = permissions.concat(flattenPermissions(permissionTemplate.permissions, true));
			}
		}

		return _.uniq(permissions);
	} catch(err) {
		systemLogger.logError("Failed to getModelPermission:", err);
	}
}

const getMeshDataFromRef = async (account, model, refObj) => {

	const { getFileAsStream } = require(`${v5Path}/services/filesManager`);

	const { elements, buffer} = refObj;

	// nodejs API on createReadStream : start and end index are inclusive, thus we need -1 on end
	const verticeRegion = {
		start: buffer.start + elements.vertices.start,
		end: buffer.start + elements.vertices.start +  elements.vertices.size - 1
	};
	const faceRegion = {
		start: buffer.start + elements.faces.start,
		end: buffer.start + elements.faces.start +  elements.faces.size - 1
	};

	const { readStream: vertices } =  await getFileAsStream(account, `${model}.scene` , buffer.name, verticeRegion);
	const { readStream: faces } = await getFileAsStream(account, `${model}.scene`, buffer.name, faceRegion);

	return { vertices, faces };
};

async function getMeshById(account, model, meshId) {
	const projection = {
		parents: 1,
		vertices: 1,
		faces: 1,
		_blobRef: 1,
		primitive: 1,
		rev_id: 1
	};

	const mesh = await getNodeById(account, model, utils.stringToUUID(meshId), projection);

	if (!mesh) {
		throw responseCodes.RESOURCE_NOT_FOUND;
	}
	mesh.matrix = await getParentMatrix(account, model, mesh.parents[0], [mesh.rev_id]);

	let res;

	if (mesh._blobRef) {
		res = await getMeshDataFromRef(account, model, mesh._blobRef);

	} else {
		throw new Error(`Could not find mesh data for ${meshId}`);
	}

	const { vertices, faces } = res;

	if (!("primitive" in mesh)) { // if the primitive type is missing, then set it to triangles for backwards compatibility. this matches the behaviour of the bouncer api.
		mesh.primitive = 3;
	}

	const combinedStream = CombinedStream.create();
	combinedStream.append(stringToStream(["{\"matrix\":", JSON.stringify(mesh.matrix)].join("")));
	combinedStream.append(stringToStream([",\"primitive\":", mesh.primitive].join("")));
	combinedStream.append(stringToStream(",\"vertices\":["));
	combinedStream.append(vertices.pipe(new BinToVector3dStringStream({isLittleEndian: true})));
	combinedStream.append(stringToStream("],\"faces\":["));
	combinedStream.append(faces.pipe(new BinToFaceStringStream({isLittleEndian: true})));
	combinedStream.append(stringToStream("]}"));
	return 	combinedStream;
}

async function getSubModelRevisions(account, model, branch, rev) {
	const history = await  History.getHistory(account, model, branch, rev);

	if(!history) {
		return Promise.reject(responseCodes.INVALID_TAG_NAME);
	}

	const refNodes = await getRefNodes(account, model, branch, rev);
	const modelIds = refNodes.map((refNode) => refNode.project);
	const results = {};

	const param = {};
	param[account] = modelIds;

	const promises = [];

	const projection = {_id : 1, tag: 1, timestamp: 1, desc: 1, author: 1};
	modelIds.forEach((modelId) => {
		results[modelId] = {};
		promises.push(History.listByBranch(account, modelId, null, projection).then((revisions) => {
			revisions = History.clean(revisions);

			revisions.forEach(function(revision) {
				revision.branch = history.branch || C.MASTER_BRANCH_NAME;
			});
			results[modelId].revisions = revisions;
		}));
	});

	promises.push(getModelsData(param).then((modelNameResult) => {
		const lookUp = modelNameResult[account];
		modelIds.forEach((modelId) => {
			results[modelId].name = lookUp[modelId].name;
		});
	}));

	return Promise.all(promises).then(() => results);
}

const getModelSetting = async (account, model, username) => {
	let setting = await findModelSettingById(account, model);

	if (!setting) {
		throw { resCode: responseCodes.MODEL_INFO_NOT_FOUND};
	} else {
		// compute permissions by user role
		const [permissions, submodels] = await Promise.all([
			getModelPermission(
				username,
				setting,
				account
			),
			listSubModels(account, model, C.MASTER_BRANCH_NAME)
		]);

		setting = await prepareDefaultView(account, model, setting);

		return {
			...setting,
			account,
			model: setting._id,
			headRevisions: {},
			permissions,
			subModels: submodels
		};
	}
};

module.exports = {
	_fillInModelDetails,
	_getModels,
	_makeAccountObject,
	createNewModel,
	createNewFederation,
	createFederatedModel,
	listSubModels,
	searchTree,
	downloadLatest,
	importModel,
	removeModel,
	getModelPermission,
	getSubModelRevisions,
	setStatus,
	getMeshById,
	getModelSetting,
	flattenPermissions
};
