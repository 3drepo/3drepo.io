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

const db = require("../../handler/db");
const {
	prepareDefaultView,
	createNewSetting,
	deleteModelSetting,
	findModelSettingById,
	findModelSettings,
	findPermissionByUser,
	getModelsData,
	isModelNameExists,
	setModelImportFail,
	setModelImportSuccess,
	setModelStatus,
	createCorrelationId
} = require("../modelSetting");
const User = require("../user");
const responseCodes = require("../../response_codes");
const importQueue = require("../../services/queue");
const C = require("../../constants");
const Mailer = require("../../mailer/mailer");
const systemLogger = require("../../logger.js").systemLogger;
const History = require("../history");
const { getRefNodes } = require("../ref");
const { findNodesByType, getGridfsFileStream, getNodeById, getParentMatrix } = require("../scene");
const utils = require("../../utils");
const middlewares = require("../../middlewares/middlewares");
const fs = require("fs");
const ChatEvent = require("../chatEvent");
const { addModelToProject, createProject, findOneProject, removeProjectModel } = require("../project");
const _ = require("lodash");
const FileRef = require("../fileRef");
const notifications = require("../notification");
const CombinedStream = require("combined-stream");
const stringToStream = require("string-to-stream");
const { StreamBuffer } = require("./stream");
const { BinToFaceStringStream, BinToVector3dStringStream } = require("./binary");
const PermissionTemplates = require("../permissionTemplates");
const AccountPermissions = require("../accountPermissions");

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

/** *****************************************************************************
 * Converts error code from repobouncerclient to a response error object.
 * Uncaught error codes that are valid responseCodes will be returned,
 * otherwise FILE_IMPORT_UNKNOWN_ERR is returned.
 * @param {errCode} - error code referenced in error_codes.h
 *******************************************************************************/
function translateBouncerErrCode(bouncerErrorCode) {
	// These error codes correspond to the error messages to 3drepobouncer
	// refer to bouncer/repo/error_codes.h for what they are.

	const bouncerErrToWebErr = [
		{ res: responseCodes.OK, softFail: false, userErr: false},
		{ res: responseCodes.FILE_IMPORT_UNKNOWN_ERR, softFail: false, userErr: false},
		{ res: responseCodes.NOT_AUTHORIZED, softFail: false, userErr: false},
		{ res: responseCodes.FILE_IMPORT_UNKNOWN_ERR, softFail: false, userErr: false},
		{ res: responseCodes.FILE_IMPORT_UNKNOWN_ERR, softFail: false, userErr: false},
		{ res: responseCodes.FILE_IMPORT_UNKNOWN_ERR, softFail: false, userErr: false},
		{ res: responseCodes.FILE_IMPORT_STASH_GEN_FAILED, softFail: false, userErr: false},
		{ res: responseCodes.FILE_IMPORT_MISSING_TEXTURES, softFail: true, userErr: true},
		{ res: responseCodes.FILE_IMPORT_UNKNOWN_ERR, softFail: false, userErr: false},
		{ res: responseCodes.REPOERR_FED_GEN_FAIL, softFail: false, userErr: false},
		{ res: responseCodes.FILE_IMPORT_MISSING_NODES, softFail: true, userErr: true},
		{ res: responseCodes.FILE_IMPORT_UNKNOWN_ERR, softFail: false, userErr: false},
		{ res: responseCodes.FILE_IMPORT_UNKNOWN_ERR, softFail: false, userErr: false},
		{ res: responseCodes.FILE_IMPORT_UNKNOWN_ERR, softFail: false, userErr: false},
		{ res: responseCodes.FILE_IMPORT_BUNDLE_GEN_FAILED, softFail: false, userErr: false},
		{ res: responseCodes.FILE_IMPORT_LOAD_SCENE_INVALID_MESHES, softFail: true, userErr: false},
		{ res: responseCodes.FILE_IMPORT_PROCESS_ERR, softFail: false, userErr: false},
		{ res: responseCodes.FILE_IMPORT_NO_MESHES, softFail: false, userErr: true},
		{ res: responseCodes.FILE_IMPORT_BAD_EXT, softFail: false, userErr: false},
		{ res: responseCodes.FILE_IMPORT_PROCESS_ERR, softFail: false, userErr: false},
		{ res: responseCodes.FILE_IMPORT_PROCESS_ERR, softFail: false, userErr: false},
		{ res: responseCodes.FILE_IMPORT_PROCESS_ERR, softFail: false, userErr: false},
		{ res: responseCodes.FILE_IMPORT_UNSUPPORTED_VERSION_BIM, softFail: false, userErr: true},
		{ res: responseCodes.FILE_IMPORT_UNSUPPORTED_VERSION_FBX, softFail: false, userErr: true},
		{ res: responseCodes.FILE_IMPORT_UNSUPPORTED_VERSION, softFail: false, userErr: true},
		{ res: responseCodes.FILE_IMPORT_MAX_NODES_EXCEEDED, softFail: false, userErr: false},
		{ res: responseCodes.FILE_IMPORT_ODA_NOT_SUPPORTED, softFail: false, userErr: false},
		{ res: responseCodes.FILE_IMPORT_NO_3D_VIEW, softFail: false, userErr: true},
		{ res: responseCodes.FILE_IMPORT_UNKNOWN_ERR, softFail: false, userErr: false},
		{ res: responseCodes.FILE_IMPORT_TIMED_OUT, softFail: false, userErr: false},
		{ res: responseCodes.FILE_IMPORT_SYNCHRO_NOT_SUPPORTED, softFail: false, userErr: false},
		{ res: responseCodes.FILE_IMPORT_MAX_NODE_EXCEEDED, softFail: false, userErr: true},
		{ res: responseCodes.FILE_IMPORT_PROCESS_ERR, softFail: false, userErr: false},
		{ res: responseCodes.FILE_IMPORT_PROCESS_ERR, softFail: false, userErr: false},
		{ res: responseCodes.FILE_IMPORT_GEOMETRY_ERR, softFail: false, userErr: false} // 34
	];

	const errObj =  bouncerErrToWebErr.length > bouncerErrorCode ?
		bouncerErrToWebErr[bouncerErrorCode] : { res: responseCodes.FILE_IMPORT_UNKNOWN_ERR, userErr: false};
	errObj.res.bouncerErrorCode = bouncerErrorCode;
	return errObj;
}

function insertModelUpdatedNotificationsLatestReview(account, model) {
	History.findLatest(account, model,{tag:1}).then(h => {
		const revision = (!h || !h.tag) ? "" : h.tag;
		return notifications.upsertModelUpdatedNotifications(account, model, revision);
	}).then(n => n.forEach(ChatEvent.upsertedNotification.bind(null,null)));
}

async function importSuccess(account, model, sharedSpacePath, user) {
	try {
		const [setting, nRevisions] = await Promise.all([
			setStatus(account, model, "ok", user),
			History.revisionCount(account, model)
		]);

		if (setting) {
			systemLogger.logDebug(`Model status changed to ${setting.status} and correlation ID reset`);

			const updatedSetting = await setModelImportSuccess(account, model, setting.type === "toy" || setting.type === "sample");

			// hack to add the user field to send to the user
			const data = {user, nRevisions ,...JSON.parse(JSON.stringify(updatedSetting))};
			ChatEvent.modelStatusChanged(null, account, model, data);

			// Creates model updated notification.
			insertModelUpdatedNotificationsLatestReview(account, model);
		}
	} catch (err) {
		systemLogger.logError("Failed to invoke importSuccess:" +  err);
	}
}

/**
 * Sets failed status, error code, chat event, and E-mail upon import failure
 * @param {account} acount - User account
 * @param {model} model - Model
 * @param {user} - user who initiated the request
 * @param {sharedSpacePath} - path to sharedspace
 * @param {errCode} errCode - Defined bouncer error code or IO response code
 * @param {errMsg} errMsg - Verbose error message (errCode.message will be used if undefined)
 */
function importFail(account, model, sharedSpacePath, user, errCode, errMsg) {
	const translatedError = translateBouncerErrCode(errCode);

	setModelImportFail(account, model, translatedError.res).then(setting => {
		// hack to add the user field to send to the user
		const data = Object.assign({user}, JSON.parse(JSON.stringify(setting)));
		ChatEvent.modelStatusChanged(null, account, model, data);

		if (!errMsg) {
			errMsg = setting.errorReason.message;
		}
		if (!translatedError.userErr) {

			const attachments = [];
			if(setting.corID && sharedSpacePath) {
				const path = require("path");
				const sharedDir = path.join(sharedSpacePath, setting.corID);
				const files = fs.readdirSync(sharedDir);
				files.forEach((file) => {
					if(file.endsWith(".log")) {
						attachments.push({
							filename: file,
							path: path.join(sharedDir, file)
						});
					}
				});

			}

			Mailer.sendImportError({
				account,
				model,
				username: user,
				err: errMsg,
				corID: setting.corID,
				bouncerErr: errCode,
				attachments
			}).catch(err => systemLogger.logError(err));
		}

		// Creates model updated failed notification.
		notifications.insertModelUpdatedFailedNotifications(account, model, user, errMsg)
			.then(n => n.forEach(ChatEvent.upsertedNotification.bind(null,null)));

		// In case the error was actually a warning,
		// the model was imported so we still need to send the model_updated notifications
		if (translatedError.softFail) {
			insertModelUpdatedNotificationsLatestReview(account, model);
		}

	}).catch(err => {
		systemLogger.logError("Failed to invoke importFail:" +  err);
	});
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

function importToyProject(account, username) {

	// create a project named Sample_Project
	return createProject(username, "Sample_Project", username, [C.PERM_TEAMSPACE_ADMIN]).then(project => {

		return Promise.all([

			importToyModel(account, username, "Lego_House_Architecture", "1cac0310-e3cc-11ea-bc6b-69e466be9639", project.name),
			importToyModel(account, username, "Lego_House_Landscape", "1cab8de0-e3cc-11ea-bc6b-69e466be9639", project.name),
			importToyModel(account, username, "Lego_House_Structure", "1cac5130-e3cc-11ea-bc6b-69e466be9639", project.name)

		]).then(models => {

			// skip some steps when importing fed models
			const skip = { tree: 1 };

			const subModels = models.map(m => {
				importSuccess(account, m._id);

				return {
					model: m._id,
					database: account
				};
			});

			return importToyModel(account, username, "Lego_House_Federation", "1ccd46b0-e3cc-11ea-bc6b-69e466be9639", project.name, subModels, skip);
		});

	}).catch(err => {

		Mailer.sendImportError({
			account,
			username,
			err: err.message
		});

		return Promise.reject(err);
	});
}

function importToyModel(account, username, modelName, modelDirName, project, subModels, skip) {

	const data = {
		desc : "",
		type : "sample",
		project,
		unit: "mm",
		subModels,
		surveyPoints: [
			{
				latLong: [48.92454, 2.02831],
				position: [0, 0, 0]
			}
		],
		angleFromNorth: 145
	};

	let createModelPromise;

	const isFed = subModels && subModels.length;
	if(isFed) {
		createModelPromise = createNewFederation(account, modelName, username, data, modelDirName);
	} else {
		createModelPromise = createNewModel(account, modelName, data);
	}

	return createModelPromise.then((modelInfo) => {
		if(isFed) {
			return modelInfo.settings;
		} else {
			return importModel(account, modelInfo.settings._id, username, modelInfo.settings, {type: "toy", modelDirName, skip });
		}

	}).catch(err => {

		Mailer.sendImportError({
			account,
			modelName,
			username,
			err: err.message,
			corID: err.corID,
			appId: err.appId
		});

		return Promise.reject(err);
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

			} else if (source.type === "toy") {

				return importQueue.importToyModel(correlationId, account, model, source).then(() => {
					systemLogger.logInfo(`Job ${modelSetting.corID} imported without error`,{account, model, username});
					return modelSetting;
				});
			}

		});
	}).catch(err => {
		systemLogger.logError("Failed to importModel:", err);
		return Promise.reject(err);
	});

}

function isSubModel(account, model) {
	return findModelSettings(account, { federate: true }).then((feds) => {
		const promises = [];

		feds.forEach(modelSetting => {
			promises.push(listSubModels(account, modelSetting._id).then(subModels => {
				return subModels.find(subModel => subModel.model === model);
			}));
		});

		return Promise.all(promises).then((results) => {
			return results.reduce((isSub, current) => isSub || current, false);
		});
	});
}

async function removeModelCollections(account, model) {
	try {
		await FileRef.removeAllFilesFromModel(account, model);
	} catch (err) {
		systemLogger.logError("Failed to remove files", err);
	}

	const collections = await db.listCollections(account);
	const promises = [];

	collections.forEach(collection => {
		if(collection.name.startsWith(model + ".")) {
			promises.push(db.dropCollection(account, collection));
		}
	});

	return Promise.all(promises);
}

function removeModel(account, model, forceRemove) {
	return findModelSettingById(account, model).then(setting => {
		if (!setting) {
			return Promise.reject(responseCodes.MODEL_NOT_FOUND);
		}

		let subModelCheckPromise;
		if (!forceRemove && !setting.federate) {
			subModelCheckPromise = isSubModel(account, model);

		} else {
			subModelCheckPromise = Promise.resolve(false);
		}

		return subModelCheckPromise.then((isSub) => {
			if (isSub) {
				return Promise.reject(responseCodes.MODEL_IS_A_SUBMODEL);
			}
			return removeModelCollections(account, model).then(() => {
				const deletePromises = [];
				deletePromises.push(deleteModelSetting(account, model));
				deletePromises.push(removeProjectModel(account, model));
				return Promise.all(deletePromises);
			}).catch((err) => {
				systemLogger.logError("Failed to remove collections: ", err);
				return Promise.reject(responseCodes.REMOVE_MODEL_FAILED);
			});
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
		const dbUser = await User.findByUserName(account);
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
			const permissionTemplate = PermissionTemplates.findById(dbUser, template.permission);

			if(permissionTemplate && permissionTemplate.permissions) {
				permissions = permissions.concat(flattenPermissions(permissionTemplate.permissions, true));
			}
		}

		return _.uniq(permissions);
	} catch(err) {
		systemLogger.logError("Failed to getModelPermission:", err);
	}
}

async function getMeshById(account, model, meshId) {
	const projection = {
		parents: 1,
		vertices: 1,
		faces: 1,
		_extRef: 1,
		primitive: 1,
		rev_id: 1
	};

	const mesh = await getNodeById(account, model, utils.stringToUUID(meshId), projection);

	if (!mesh) {
		throw responseCodes.RESOURCE_NOT_FOUND;
	}
	mesh.matrix = await getParentMatrix(account, model, mesh.parents[0], [mesh.rev_id]);

	const vertices =  mesh.vertices ? new StreamBuffer({buffer: mesh.vertices.buffer, chunkSize: mesh.vertices.buffer.length}) : await getGridfsFileStream(account, model, mesh._extRef.vertices);
	const faces = mesh.faces ?  new StreamBuffer({buffer: mesh.faces.buffer, chunkSize: mesh.faces.buffer.length})  : await getGridfsFileStream(account, model, mesh._extRef.faces);

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
	importToyModel,
	importToyProject,
	createFederatedModel,
	listSubModels,
	searchTree,
	downloadLatest,
	importModel,
	removeModel,
	getModelPermission,
	getSubModelRevisions,
	setStatus,
	importSuccess,
	importFail,
	getMeshById,
	getModelSetting,
	flattenPermissions
};
