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

const ModelFactory = require("../factory/modelFactory");
const ModelSetting = require("../modelSetting");
const User = require("../user");
const responseCodes = require("../../response_codes");
const importQueue = require("../../services/queue");
const C = require("../../constants");
const Mailer = require("../../mailer/mailer");
const systemLogger = require("../../logger.js").systemLogger;
const config = require("../../config");
const History = require("../history");
const { getRefNodes } = require("../ref");
const { findNodesByType, getGridfsFileStream, getNodeById, getParentMatrix } = require("../scene");
const utils = require("../../utils");
const middlewares = require("../../middlewares/middlewares");
const multer = require("multer");
const fs = require("fs");
const ChatEvent = require("../chatEvent");
const { addModelToProject, createProject, findOneProject, removeProjectModel } = require("../project");
const _ = require("lodash");
const nodeuuid = require("uuid/v1");
const FileRef = require("../fileRef");
const notifications = require("../notification");
const CombinedStream = require("combined-stream");
const stringToStream = require("string-to-stream");
const { StreamBuffer } = require("./stream");
const { BinToTriangleStringStream, BinToVector3dStringStream } = require("./binary");
const PermissionTemplates = require("../permissionTemplates");
const AccountPermissions = require("../accountPermissions");

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
		{ res: responseCodes.FILE_IMPORT_PROCESS_ERR, softFail: false, userErr: false}
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
function importSuccess(account, model, sharedSpacePath, user) {
	Promise.all([
		setStatus(account, model, "ok", user),
		History.revisionCount(account, model)
	]).then(([setting, nRevisions]) => {
		if (setting) {
			if (sharedSpacePath && setting.corID) {
				const path = require("path");
				const tmpDir = path.join(sharedSpacePath, setting.corID);
				const tmpModelFile = path.join(sharedSpacePath, `${setting.corID}.json`);
				const filesToDelete  = [{ type:"file", path: tmpModelFile}];

				fs.readdirSync(tmpDir).forEach((file) => {
					filesToDelete.push({ type: "file", path: path.join(tmpDir, file)});
				});

				_deleteFiles(filesToDelete);
				_deleteFiles([{desc: "tmp dir", type: "dir", path: tmpDir}]);
			}
			systemLogger.logInfo(`Model status changed to ${setting.status} and correlation ID reset`);
			setting.corID = undefined;
			setting.errorReason = undefined;
			if(setting.type === "toy" || setting.type === "sample") {
				setting.timestamp = new Date();
			}
			setting.markModified("errorReason");

			// hack to add the user field to send to the user
			const data = {user, nRevisions ,...JSON.parse(JSON.stringify(setting))};
			ChatEvent.modelStatusChanged(null, account, model, data);

			// Creates model updated notification.
			insertModelUpdatedNotificationsLatestReview(account, model);

			setting.save();
		}
	}).catch(err => {
		systemLogger.logError("Failed to invoke importSuccess:" +  err);
	});
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
	ModelSetting.findById({account, model}, model).then(setting => {
		// mark model failed
		setting.status = "failed";
		if(setting.type === "toy" || setting.type === "sample") {
			setting.timestamp = undefined;
		}

		const translatedError = translateBouncerErrCode(errCode);
		setting.errorReason = translatedError.res;

		setting.markModified("errorReason");
		setting.save().then(() => {
			// hack to add the user field to send to the user
			const data = Object.assign({user}, JSON.parse(JSON.stringify(setting)));
			ChatEvent.modelStatusChanged(null, account, model, data);
		});

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
function setStatus(account, model, status, user) {
	ChatEvent.modelStatusChanged(null, account, model, { status, user });
	return ModelSetting.findById({account, model}, model).then(setting => {
		setting.status = status;
		systemLogger.logInfo(`Model status changed to ${status}`);
		return setting.save();
	}).catch(err => {
		systemLogger.logError("Failed to invoke setStatus:", err);
	});
}

/**
 * Create correlation ID, store it in model setting, and return it
 * @param {account} account - User account
 * @param {model} model - Model
 * @param {addTimestamp} - add a timestamp to the model settings while you're at it
 */
function createCorrelationId(setting, addTimestamp = false) {
	const correlationId = nodeuuid();

	if(setting) {
		setting.corID = correlationId;
		if (addTimestamp) {
			// FIXME: This is a temporary workaround, needed because federation
			// doesn't update it's own timestamp (and also not wired into the chat)
			setting.timestamp = new Date();
		}
		systemLogger.logInfo(`Correlation ID ${setting.corID} set`);

		return setting.save().then(() => {
			return correlationId;
		});
	}

	return Promise.reject("setting is undefined");
}

/**
 * Clear correlation ID from model setting when processing returns
 * @param {account} account - User account
 * @param {model} model - Model
 */
function resetCorrelationId(account, model) {
	ModelSetting.findById({account, model}, model).then(setting => {
		setting.corID = undefined;
		systemLogger.logInfo("Correlation ID reset");
		setting.save();
	}).catch(err => {
		systemLogger.logError("Failed to resetCorrelationId:", err);
	});
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

		// Check there's no other model within the same project with the model name
		return ModelSetting.count({account: teamspace},
			{name: modelName, _id: {"$in": project.models}}).then((count) => {
			return count > 0;
		}).then((modelNameExists) => {
			if(modelNameExists) {
				return Promise.reject({resCode: responseCodes.MODEL_EXIST});
			}

			// Create a model setting
			return ModelSetting.createNewSetting(teamspace, modelName, data).then((settings) => {
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

				m = m.toObject();

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

		addSubModelsPromise.push(ModelSetting.findById({account, model: subModel.model}, subModel.model).then(setting => {
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

	const fedSettings = modelSettings ? Promise.resolve(modelSettings)
		: ModelSetting.findById({account}, model);

	return Promise.all(addSubModelsPromise).then(() => {
		return fedSettings.then((settings) => {
			return createCorrelationId(settings, true).then(correlationId => {
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

			ModelSetting.findById({ account: ref.owner}, ref.project, { name: 1 }).then(subModel => {
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

async function uploadFile(req) {
	if (!config.cn_queue) {
		return Promise.reject(responseCodes.QUEUE_NO_CONFIG);
	}

	const account = req.params.account;
	const model = req.params.model;
	const user = req.session.user.username;

	ChatEvent.modelStatusChanged(null, account, model, { status: "uploading", user });
	// upload model with tag

	const uploadedFile = await new Promise((resolve, reject) => {
		const upload = multer({
			dest: config.cn_queue.upload_dir,
			fileFilter: function(fileReq, file, cb) {

				let format = file.originalname.split(".");

				if(format.length <= 1) {
					return cb({resCode: responseCodes.FILE_NO_EXT});
				}

				const isIdgn = format[format.length - 1] === "dgn" && format[format.length - 2] === "i";

				format = format[format.length - 1];

				const size = parseInt(fileReq.headers["content-length"]);

				if(isIdgn || acceptedFormat.indexOf(format.toLowerCase()) === -1) {
					return cb({resCode: responseCodes.FILE_FORMAT_NOT_SUPPORTED });
				}

				if(size > config.uploadSizeLimit) {
					return cb({ resCode: responseCodes.SIZE_LIMIT });
				}

				const sizeInMB = size / (1024 * 1024);
				middlewares.freeSpace(account).then(space => {

					if(sizeInMB > space) {
						cb({ resCode: responseCodes.SIZE_LIMIT_PAY });
					} else {
						cb(null, true);
					}
				});
			}
		});

		upload.single("file")(req, null, function (err) {
			if (err) {
				return reject(err);

			} else if(!req.file.size) {
				return reject(responseCodes.FILE_FORMAT_NOT_SUPPORTED);

			} else {
				ChatEvent.modelStatusChanged(null, account, model, { status: "uploaded" });
				return resolve(req.file);
			}
		});
	});

	// req.body.tag wont be defined after the file has been uploaded
	await History.isValidTag(account, model, req.body.tag);

	return uploadedFile;
}

function _deleteFiles(files) {

	files.forEach(file => {

		const deleteFile = (file.type === "file" ? fs.unlinkSync : fs.rmdirSync);

		try {
			deleteFile(file.path);
		} catch(err) {
			systemLogger.logError("error while deleting file",{
				message: err.message,
				err: err,
				file: file.path
			});
		}
	});
}

/**
 * Called by importModel to perform model upload
 */
function _handleUpload(correlationId, account, model, username, file, data) {

	return importQueue.importFile(
		correlationId,
		file.path,
		file.originalname,
		account,
		model,
		username,
		null,
		data.tag,
		data.desc,
		data.importAnimations
	);
}

function importModel(account, model, username, modelSetting, source, data) {

	if(!modelSetting) {
		return Promise.reject({ message: `modelSetting is ${modelSetting}`});
	}

	return modelSetting.save().then(() => {
		return createCorrelationId(modelSetting).then(correlationId => {
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
		});
	}).catch(err => {
		systemLogger.logError("Failed to importModel:", err);
		return Promise.reject(err);
	});

}

function isSubModel(account, model) {
	return ModelSetting.find({ account, model}, { federate: true }).then((feds) => {
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

	const collections = await ModelFactory.dbManager.listCollections(account);
	const promises = [];

	collections.forEach(collection => {
		if(collection.name.startsWith(model + ".")) {
			promises.push(ModelFactory.dbManager.dropCollection(account, collection));
		}
	});

	return Promise.all(promises);
}

function removeModel(account, model, forceRemove) {
	return ModelSetting.findById({account, model}, model).then(setting => {
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
				deletePromises.push(setting.remove());
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

		const template = setting.findPermissionByUser(username);

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
	const historyRes =  (await History.findByObjectId(account, model, meshId, {current:1}));
	if (!historyRes) {
		throw responseCodes.RESOURCE_NOT_FOUND;
	}

	const revisionIds = historyRes.current;
	const projection = {
		"parents": 1,
		"vertices": 1,
		"faces": 1,
		"_extRef":1
	};

	const mesh = await getNodeById(account, model, utils.stringToUUID(meshId), projection);
	mesh.matrix = await getParentMatrix(account, model, mesh.parents[0], revisionIds);

	const vertices =  mesh.vertices ? new StreamBuffer({buffer: mesh.vertices.buffer, chunkSize: mesh.vertices.buffer.length}) : await getGridfsFileStream(account, model, mesh._extRef.vertices);
	const triangles = mesh.faces ?  new StreamBuffer({buffer: mesh.faces.buffer, chunkSize: mesh.faces.buffer.length})  : await getGridfsFileStream(account, model, mesh._extRef.faces);

	const combinedStream = CombinedStream.create();
	combinedStream.append(stringToStream(["{\"matrix\":", JSON.stringify(mesh.matrix), ",\"vertices\":["].join("")));
	combinedStream.append(vertices.pipe(new BinToVector3dStringStream({isLittleEndian: true})));
	combinedStream.append(stringToStream("],\"triangles\":["));
	combinedStream.append(triangles.pipe(new BinToTriangleStringStream({isLittleEndian: true})));
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

	promises.push(ModelSetting.getModelsData(param).then((modelNameResult) => {
		const lookUp = modelNameResult[account];
		modelIds.forEach((modelId) => {
			results[modelId].name = lookUp[modelId].name;
		});
	}));

	return Promise.all(promises).then(() => results);
}

const fileNameRegExp = /[ *"/\\[\]:;|=,<>$]/g;
const acceptedFormat = [
	"x","obj","3ds","md3","md2","ply",
	"mdl","ase","hmp","smd","mdc","md5",
	"stl","lxo","nff","raw","off","ac",
	"bvh","irrmesh","irr","q3d","q3s","b3d",
	"dae","ter","csm","3d","lws","xml","ogex",
	"ms3d","cob","scn","blend","pk3","ndo",
	"ifc","xgl","zgl","fbx","assbin", "bim", "dgn",
	"rvt", "rfa", "spm"
];

const getModelSetting = async (account, model, username) => {
	let setting = await ModelSetting.findById({account}, model);

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

		setting = await setting.clean();
		setting.model = setting._id;
		setting.account = account;
		setting.headRevisions = {};
		setting.permissions = permissions;
		setting.subModels = submodels;
		return setting;
	}
};

module.exports = {
	createNewModel,
	createNewFederation,
	importToyModel,
	importToyProject,
	createFederatedModel,
	listSubModels,
	searchTree,
	downloadLatest,
	fileNameRegExp,
	acceptedFormat,
	uploadFile,
	importModel,
	removeModel,
	getModelPermission,
	resetCorrelationId,
	getSubModelRevisions,
	setStatus,
	importSuccess,
	importFail,
	getMeshById,
	getModelSetting,
	flattenPermissions
};
