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
const Scene = require("../scene");
const Ref = require("../ref");
const utils = require("../../utils");
const middlewares = require("../../middlewares/middlewares");
const multer = require("multer");
const fs = require("fs");
const ChatEvent = require("../chatEvent");
const Project = require("../project");
const _ = require("lodash");
const uuid = require("node-uuid");
const FileRef = require("../fileRef");
const notifications = require("../notification");

/** *****************************************************************************
 * Converts error code from repobouncerclient to a response error object.
 * Uncaught error codes that are valid responseCodes will be returned,
 * otherwise FILE_IMPORT_UNKNOWN_ERR is returned.
 * @param {errCode} - error code referenced in error_codes.h
 *******************************************************************************/
function convertToErrorCode(bouncerErrorCode) {
	// These error codes correspond to the error messages to 3drepobouncer
	// refer to bouncer/repo/error_codes.h for what they are.
	const bouncerErrToWebErr = [
		responseCodes.OK,
		responseCodes.FILE_IMPORT_UNKNOWN_ERR,
		responseCodes.NOT_AUTHORIZED,
		responseCodes.FILE_IMPORT_UNKNOWN_ERR,
		responseCodes.FILE_IMPORT_UNKNOWN_ERR,
		responseCodes.FILE_IMPORT_UNKNOWN_ERR,
		responseCodes.FILE_IMPORT_STASH_GEN_FAILED,
		responseCodes.FILE_IMPORT_MISSING_TEXTURES,
		responseCodes.FILE_IMPORT_UNKNOWN_ERR,
		responseCodes.REPOERR_FED_GEN_FAIL,
		responseCodes.FILE_IMPORT_MISSING_NODES,
		responseCodes.FILE_IMPORT_UNKNOWN_ERR,
		responseCodes.FILE_IMPORT_UNKNOWN_ERR,
		responseCodes.FILE_IMPORT_UNKNOWN_ERR,
		responseCodes.FILE_IMPORT_BUNDLE_GEN_FAILED,
		responseCodes.FILE_IMPORT_LOAD_SCENE_INVALID_MESHES,
		responseCodes.FILE_IMPORT_PROCESS_ERR,
		responseCodes.FILE_IMPORT_NO_MESHES,
		responseCodes.FILE_IMPORT_BAD_EXT,
		responseCodes.FILE_IMPORT_PROCESS_ERR,
		responseCodes.FILE_IMPORT_PROCESS_ERR,
		responseCodes.FILE_IMPORT_PROCESS_ERR,
		responseCodes.FILE_IMPORT_UNSUPPORTED_VERSION_BIM,
		responseCodes.FILE_IMPORT_UNSUPPORTED_VERSION_FBX,
		responseCodes.FILE_IMPORT_UNSUPPORTED_VERSION,
		responseCodes.FILE_IMPORT_MAX_NODES_EXCEEDED,
		responseCodes.FILE_IMPORT_ODA_NOT_SUPPORTED,
		responseCodes.FILE_IMPORT_NO_3D_VIEW

	];

	const errObj =  bouncerErrToWebErr.length > bouncerErrorCode ?
		bouncerErrToWebErr[bouncerErrorCode] : responseCodes.FILE_IMPORT_UNKNOWN_ERR;

	return Object.assign({bouncerErrorCode}, errObj);
}

function insertModelUpdatedNotificationsLatestReview(account, model) {
	History.findLatest({account, model},{tag:1}).then(h => {
		const revision = (!h || !h.tag) ? "" : h.tag;
		return notifications.insertModelUpdatedNotifications(account, model, revision);
	}).then(n => n.forEach(ChatEvent.upsertedNotification.bind(null,null)));
}
function importSuccess(account, model, sharedSpacePath, user) {
	setStatus(account, model, "ok", user).then(setting => {
		if (setting) {
			if (sharedSpacePath) {
				const files = function(filePath, fileDir, jsonFile) {
					return [
						{desc: "tmp model file", type: "file", path: filePath},
						{desc: "json file", type: "file", path: jsonFile},
						{desc: "tmp dir", type: "dir", path: fileDir}
					];
				};

				const tmpDir = `${sharedSpacePath}/${setting.corID}`;
				const tmpModelFile = `${sharedSpacePath}/${setting.corID}.json`;
				fs.stat(tmpModelFile, function(err) {
					let tmpJsonFile;
					if (err) {
						tmpJsonFile = `${tmpDir}/obj.json`;
					} else {
						const tmpModelFileData = require(tmpModelFile);
						tmpJsonFile = tmpModelFileData.file;
					}

					_deleteFiles(files(tmpModelFile, tmpDir, tmpJsonFile));
				});
			}
			systemLogger.logInfo(`Model status changed to ${setting.status} and correlation ID reset`);
			setting.corID = undefined;
			setting.errorReason = undefined;
			if(setting.type === "toy" || setting.type === "sample") {
				setting.timestamp = new Date();
			}
			setting.markModified("errorReason");

			// hack to add the user field to send to the user
			const data = Object.assign({user}, JSON.parse(JSON.stringify(setting)));
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
 * @param {errCode} errCode - Defined bouncer error code or IO response code
 * @param {errMsg} errMsg - Verbose error message (errCode.message will be used if undefined)
 * @param {sendMail} sendMail - Boolean to determine if a notification E-mail will be sent
 */
function importFail(account, model, user, errCode, errMsg, sendMail) {
	ModelSetting.findById({account, model}, model).then(setting => {
		// mark model failed
		setting.status = "failed";
		if(setting.type === "toy" || setting.type === "sample") {
			setting.timestamp = undefined;
		}
		setting.errorReason = convertToErrorCode(errCode);

		setting.markModified("errorReason");
		setting.save().then(() => {
			// hack to add the user field to send to the user
			const data = Object.assign({user}, JSON.parse(JSON.stringify(setting)));
			ChatEvent.modelStatusChanged(null, account, model, data);
		});

		if (!errMsg) {
			errMsg = setting.errorReason.message;
		}

		if (sendMail) {
			Mailer.sendImportError({
				account,
				model,
				username: user,
				err: errMsg,
				corID: setting.corID,
				bouncerErr: errCode
			}).catch(err => systemLogger.logError(err));
		}

		// Creates model updated failed notification.
		notifications.insertModelUpdatedFailedNotifications(account, model, user, errMsg)
			.then(n => n.forEach(ChatEvent.upsertedNotification.bind(null,null)));

		// In case the error was actually a warning,
		// the model was imported so we still need to send the model_updated notifications
		const warningCodes = [7, 10, 15];

		if (warningCodes.includes(errCode)) {
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
	const correlationId = uuid.v1();

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
	if(!data.hasOwnProperty("project")) {
		return Promise.reject(responseCodes.PROJECT_NOT_FOUND);
	}

	const projectName = data.project;
	return Project.findOne({account: teamspace}, {name: projectName}).then((project) => {
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
				project.models.push(settings._id);

				return project.save().then(() => {
					// call chat to indicate a new model has been created
					const modelData = {
						account: teamspace,
						model:  settings._id,
						name: modelName,
						permissions: C.MODEL_PERM_LIST,
						timestamp: undefined
					};

					// ChatEvent.newModel(data.sessionId, teamspace, modelData);
					return {modelData, settings};
				});
			});

		});
	});
}

function createNewFederation(teamspace, modelName, data, toyFed) {
	return createNewModel(teamspace, modelName, data).then((modelInfo) => {
		return createFederatedModel(teamspace, modelInfo.settings._id, data.subModels, modelInfo.settings, toyFed).then(() => {
			return modelInfo;
		});
	});
}

function importToyProject(account, username) {

	// create a project named Sample_Project
	return Project.createProject(username, "Sample_Project", username, [C.PERM_TEAMSPACE_ADMIN]).then(project => {

		return Promise.all([

			importToyModel(account, username, "Lego_House_Architecture", "33586989-6130-4787-8ea5-b56b81286ccf", project.name),
			importToyModel(account, username, "Lego_House_Landscape", "81abd908-d0b2-46f5-a9d5-38471dbfab72", project.name),
			importToyModel(account, username, "Lego_House_Structure", "94020bb8-07d3-4811-ae29-040c961ed92f", project.name)

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

			return importToyModel(account, username, "Lego_House_Federation", "51dc4f4c-0f55-4c97-b62d-3383f7d23ab3", project.name, subModels, skip);
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
		createModelPromise = createNewFederation(account, modelName, data, modelDirName);
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

function createFederatedModel(account, model, subModels, modelSettings, toyFed) {

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

	const search = (history) => {

		let items = [];

		const filter = {
			_id: {"$in": history.current },
			type: {"$in": ["transformation", "mesh"]},
			name: new RegExp(searchString, "i")
		};

		return Scene.find({account, model}, filter, { name: 1 }).then(objs => {

			objs.forEach((obj, i) => {

				objs[i] = obj.toJSON();
				objs[i].account = account;
				objs[i].model = model;
				items.push(objs[i]);

			});

			return Ref.find({account, model}, {
				_id: {"$in": history.current },
				type: "ref"
			});

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

			return History.getHistory({ account, model }, branch, rev).then(history => {
				if(history) {
					return search(history);
				} else {
					return Promise.resolve([]);
				}
			});

		} else {
			return Promise.resolve([]);
		}
	});

}

function listSubModels(account, model, branch) {

	const subModels = [];

	return History.findByBranch({ account, model }, branch).then(history => {

		if(history) {
			const filter = {
				type: "ref",
				_id: { $in: history.current }
			};

			return Ref.find({ account, model }, filter);
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
	return History.findLatest({account, model}, {rFile: 1}).then((fileEntry) => {
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

function uploadFile(req) {
	if (!config.cn_queue) {
		return Promise.reject(responseCodes.QUEUE_NO_CONFIG);
	}

	const account = req.params.account;
	const model = req.params.model;
	const user = req.session.user.username;

	ChatEvent.modelStatusChanged(null, account, model, { status: "uploading", user });
	// upload model with tag
	const checkTag = tag => {
		if(!tag) {
			return Promise.resolve();
		} else {
			return (tag.match(History.tagRegExp) ? Promise.resolve() : Promise.reject(responseCodes.INVALID_TAG_NAME)).then(() => {
				return History.findByTag({account, model}, tag, {_id: 1});
			}).then(_tag => {
				if (!_tag) {
					return Promise.resolve();
				} else {
					return Promise.reject(responseCodes.DUPLICATE_TAG);
				}
			});

		}
	};

	return new Promise((resolve, reject) => {

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
						importFail(account, model, user, responseCodes.SIZE_LIMIT_PAY);
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

	}).then(file => {
		return checkTag(req.body.tag).then(() => file);
	});

}

function _deleteFiles(files) {

	files.forEach(file => {

		const deleteFile = (file.type === "file" ? fs.unlink : fs.rmdir);

		deleteFile(file.path, function(err) {
			if(err) {
				systemLogger.logError(`error while deleting ${file.desc}`,{
					message: err.message,
					err: err,
					file: file.path
				});
			} else {
				systemLogger.logInfo(`${file.desc} deleted`,{
					file: file.path
				});
			}
		});
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
		data.desc
	).then(() => {

		systemLogger.logInfo(`Job ${correlationId} imported without error`,{
			account,
			model,
			username
		});

	});
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

function removeModelCollections(account, model) {
	return FileRef.removeAllFilesFromModel(account, model).then(() => {
		return ModelFactory.dbManager.listCollections(account).then((collections) => {
			const promises = [];

			collections.forEach(collection => {
				if(collection.name.startsWith(model + ".")) {

					promises.push(ModelFactory.dbManager.dropCollection(account, collection));
				}
			});

			return Promise.all(promises);
		});
	});
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
				deletePromises.push(Project.removeModel(account, model));
				return Promise.all(deletePromises);
			}).catch((err) => {
				systemLogger.logError("Failed to remove collections: ", err);
				return Promise.reject(responseCodes.REMOVE_MODEL_FAILED);
			});
		});
	});
}

function getModelPermission(username, setting, account) {

	if(!setting) {
		return Promise.resolve([]);
	}

	let permissions = [];
	let dbUser;

	return User.findByUserName(account).then(_dbUser => {

		dbUser = _dbUser;

		if(!dbUser) {
			return [];
		}

		const accountPerm = dbUser.customData.permissions.findByUser(username);

		if(accountPerm && accountPerm.permissions) {
			permissions = _.compact(_.flatten(accountPerm.permissions.map(p => C.IMPLIED_PERM[p] && C.IMPLIED_PERM[p].model || null)));
		}

		const projectQuery = { models: setting._id, "permissions.user": username };
		// project admin have access to models underneath it.
		return Project.findOne({account}, projectQuery, { "permissions.$" : 1 });

	}).then(project => {

		if(project && project.permissions) {
			permissions = permissions.concat(
				_.compact(_.flatten(project.permissions[0].permissions.map(p => C.IMPLIED_PERM[p] && C.IMPLIED_PERM[p].model || null)))
			);
		}

		const template = setting.findPermissionByUser(username);

		if(template) {

			const permission = dbUser.customData.permissionTemplates.findById(template.permission);

			if(permission && permission.permissions) {
				permissions = permissions.concat(
					_.flatten(permission.permissions.map(p => C.IMPLIED_PERM[p] && C.IMPLIED_PERM[p].model || p))
				);
			}
		}

		return _.uniq(permissions);
	}).catch(err => {
		systemLogger.logError("Failed to getModelPermission:", err);
	});
}

function getAllMetadata(account, model, branch, rev) {
	return getAllIdsWithMetadataField(account, model, branch, rev, "");
}

function getAllIdsWith4DSequenceTag(account, model, branch, rev) {
	// Get sequence tag then call the generic getAllIdsWithMetadataField
	return ModelSetting.findOne({account : account}, {_id : model}).then(settings => {
		if(!settings) {
			return Promise.reject(responseCodes.MODEL_NOT_FOUND);
		}
		if(!settings.fourDSequenceTag) {
			return Promise.reject(responseCodes.SEQ_TAG_NOT_FOUND);
		}
		return getAllIdsWithMetadataField(account, model,  branch, rev, settings.fourDSequenceTag);

	});
}

function getAllIdsWithMetadataField(account, model, branch, rev, fieldName, username) {
	// Get the revision object to find all relevant IDs
	let history;
	let fullFieldName = "metadata";

	if (fieldName && fieldName.length > 0) {
		fullFieldName += "." + fieldName;
	}

	return History.getHistory({ account, model }, branch, rev).then(_history => {
		history = _history;
		if(!history) {
			return Promise.reject(responseCodes.METADATA_NOT_FOUND);
		}
		// Check for submodel references
		const filter = {
			type: "ref",
			_id: { $in: history.current }
		};
		return Ref.find({ account, model }, filter);
	}).then(refs =>{

		// for all refs get their tree
		const getMeta = [];

		refs.forEach(ref => {

			let refBranch, refRev;

			if (utils.uuidToString(ref._rid) === C.MASTER_BRANCH) {
				refBranch = C.MASTER_BRANCH_NAME;
			} else {
				refRev = utils.uuidToString(ref._rid);
			}

			getMeta.push(
				getAllIdsWithMetadataField(ref.owner, ref.project, refBranch, refRev, fieldName, username)
					.then(obj => {
						return Promise.resolve({
							data: obj.data,
							account: ref.owner,
							model: ref.project
						});
					})
					.catch(() => {
					// Just because a sub model fails doesn't mean everything failed. Resolve the promise.
						return Promise.resolve();
					})
			);
		});

		return Promise.all(getMeta);

	}).then(_subMeta => {

		const match = {
			_id: {"$in": history.current}
		};
		match[fullFieldName] =  {"$exists" : true};

		const projection = {
			parents: 1
		};
		projection[fullFieldName] = 1;

		return Scene.find({account, model}, match, projection).then(obj => {
			if(obj) {
				// rename fieldName to "value"
				const parsedObj = {data: obj};
				if(obj.length > 0 && fieldName && fieldName.length > 0) {
					const objStr = JSON.stringify(obj);
					parsedObj.data = JSON.parse(objStr.replace(new RegExp(fieldName, "g"), "value"));
				}
				if(_subMeta.length > 0) {
					parsedObj.subModels = _subMeta;
				}
				return parsedObj;
			} else {
				return Promise.reject(responseCodes.METADATA_NOT_FOUND);
			}
		});

	});

}

function getMetadata(account, model, id) {

	const projection = {
		shared_id: 0,
		paths: 0,
		type: 0,
		api: 0,
		parents: 0
	};

	return Scene.findOne({account, model}, { _id: utils.stringToUUID(id) }, projection).then(obj => {
		if(obj) {
			return obj;
		} else {
			return Promise.reject(responseCodes.METADATA_NOT_FOUND);
		}
	});

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
	"rvt", "rfa"
];

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
	getMetadata,
	resetCorrelationId,
	getAllMetadata,
	getAllIdsWith4DSequenceTag,
	getAllIdsWithMetadataField,
	setStatus,
	importSuccess,
	importFail
};
