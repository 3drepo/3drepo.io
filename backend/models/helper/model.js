/**
 *  Copyright (C) 2014 3D Repo Ltd
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

const ModelFactory = require('../factory/modelFactory');
const ModelSetting = require('../modelSetting');
const User = require('../user');
const responseCodes = require('../../response_codes');
const importQueue = require('../../services/queue');
const C = require('../../constants');
const Mailer = require('../../mailer/mailer');
const systemLogger = require("../../logger.js").systemLogger;
const config = require('../../config');
const History = require('../history');
const Scene = require('../scene');
const Ref = require('../ref');
const utils = require("../../utils");
const stash = require('./stash');
const middlewares = require('../../middlewares/middlewares');
const multer = require("multer");
const fs = require('fs');
const ChatEvent = require('../chatEvent');
const Project = require('../project');
const stream = require('stream');
const _ = require('lodash');
const uuid = require("node-uuid");

/*******************************************************************************
 * Converts error code from repobouncerclient to a response error object
 * @param {errCode} - error code referenced in error_codes.h
 *******************************************************************************/
function convertToErrorCode(bouncerErrorCode){

	let errObj;

	switch (bouncerErrorCode) {
		case 0:
			errObj = responseCodes.OK;
			break;
		case 1:
			errObj = responseCodes.FILE_IMPORT_LAUNCHING_COMPUTE_CLIENT;
			break;
		case 2:
			errObj = responseCodes.NOT_AUTHORIZED;
			break;
		case 3:
			errObj = responseCodes.FILE_IMPORT_UNKNOWN_CMD;
			break;
		case 4:
			errObj = errObj = responseCodes.FILE_IMPORT_UNKNOWN_ERR;
			break;
		case 5:
			errObj = responseCodes.FILE_IMPORT_LOAD_SCENE_FAIL;
			break;
		case 6:
			errObj = responseCodes.FILE_IMPORT_STASH_GEN_FAILED;
			break;
		case 7:
			errObj = responseCodes.FILE_IMPORT_MISSING_TEXTURES;
			break;
		case 8:
			errObj = responseCodes.FILE_IMPORT_INVALID_ARGS;
			break;
		case 9:
			errObj = responseCodes.REPOERR_FED_GEN_FAIL;
			break;
		case 10:
			errObj = responseCodes.FILE_IMPORT_MISSING_NODES;
			break;
		case 11:
			errObj = responseCodes.FILE_IMPORT_GET_FILE_FAILED;
			break;
		case 12:
			errObj = responseCodes.FILE_IMPORT_CRASHED;
			break;
		case 13:
			errObj = responseCodes.FILE_IMPORT_FILE_READ_FAILED;
			break;
		case 14:
			errObj = responseCodes.FILE_IMPORT_BUNDLE_GEN_FAILED;
			break;
		case 15:
			errObj = responseCodes.FILE_IMPORT_LOAD_SCENE_INVALID_MESHES;
			break;
		default:
			errObj = responseCodes.FILE_IMPORT_UNKNOWN_ERR;
			break;

	}
	
	return Object.assign({bouncerErrorCode}, errObj);
}

function importSuccess(account, model) {
	setStatus(account, model, 'ok').then(setting => {
		if (setting) {
			systemLogger.logInfo(`Model status changed to ${setting.status} and correlation ID reset`);
			setting.corID = undefined;
			setting.errorReason = undefined;
			if(setting.type === 'toy' || setting.type === 'sample'){
				setting.timestamp = new Date();
			}
			setting.markModified('errorReason');
			ChatEvent.modelStatusChanged(null, account, model, setting);
			setting.save();
		}
	});
}

function importFail(account, model, errCode, corId) {
	ModelSetting.findById({account, model}, model).then(setting => {
		//mark model failed
		setting.status = 'failed';
		setting.errorReason = convertToErrorCode(errCode);
		setting.markModified('errorReason');
		setting.save().then( () => {				
			ChatEvent.modelStatusChanged(null, account, model, setting);						
		})

		Mailer.sendImportError({
			account,
			model,
			username: account,
			err: convertToErrorCode(errCode).message,
			corID: corId
		});
	});
}

/**
 * Create correlation ID, store it in model setting, and return it
 * @param {account} account - User account
 * @param {model} model - Model
 */
function setStatus(account, model, status) {
	ChatEvent.modelStatusChanged(null, account, model, { status: status });
	return ModelSetting.findById({account, model}, model).then(setting => {
		setting.status = status;
		systemLogger.logInfo(`Model status changed to ${status}`);
		return setting.save();
	});
}

/**
 * Create correlation ID, store it in model setting, and return it
 * @param {account} account - User account
 * @param {model} model - Model
 */
function createCorrelationId(account, model) {
	let correlationId = uuid.v1();

	// store corID
	return ModelSetting.findById({account, model}, model).then(setting => {
		setting = setting || ModelSetting.createInstance({
			account: account,
			model: model
		});

		setting._id = model;
		setting.corID = correlationId;
		systemLogger.logInfo(`Correlation ID ${setting.corID} set`);
		return setting.save().then(() => {
			return correlationId;
		});;
	});
}

/**
 * Clear correlation ID from model setting when processing returns
 * @param {account} account - User account
 * @param {model} model - Model
 */
function resetCorrelationId(account, model) {
	ModelSetting.findById({account, model}, model).then(setting => {
		setting.corID = undefined;
		systemLogger.logInfo(`Correlation ID reset`);
		setting.save();
	});
}

function createAndAssignRole(modelName, account, username, data) {
	

	let project;
	//generate model id
	const model = utils.generateUUID({string: true});

	if(!modelName.match(modelNameRegExp)){
		return Promise.reject({ resCode: responseCodes.INVALID_MODEL_NAME });
	}

	if(data.code && !ModelSetting.modelCodeRegExp.test(data.code)){
		return Promise.reject({ resCode: responseCodes.INVALID_MODEL_CODE });
	}

	if(!data.unit){
		return Promise.reject({ resCode: responseCodes.MODEL_NO_UNIT });
	}

	if(C.REPO_BLACKLIST_MODEL.indexOf(modelName) !== -1){
		return Promise.reject({ resCode: responseCodes.BLACKLISTED_MODEL_NAME });
	}

	let promise = Promise.resolve();

	if(data.project){
		promise = Project.findOne({account}, {name: data.project}).then(_project => {

			if(!_project){
				return Promise.reject(responseCodes.PROJECT_NOT_FOUND);
			} else {
				project = _project;
			}

		});
	} 

	return promise.then(() => {
		
		const query =  {name: modelName};

		if(data.project){
			query._id = { '$in' : project.models};
		}

		return ModelSetting.count({account, model}, query);

	}).then(count => {

		if(count){
			return Promise.reject({resCode: responseCodes.MODEL_EXIST});
		}

		return (data.subModels ? createFederatedModel(account, model, data.subModels) : Promise.resolve());

	}).then(() => {

		return ModelSetting.findById({account, model}, model);

	}).then(setting => {

		setting = setting || ModelSetting.createInstance({
			account: account,
			model: model
		});

		setting._id = model;
		setting.name = modelName;
		setting.owner = username;
		setting.desc = data.desc;
		setting.type = data.type;

		if(data.subModels){
			setting.federate = true;
			setting.subModels = data.subModels;
			setting.timestamp = new Date();
		}

		setting.updateProperties({
			unit: data.unit,
			code: data.code,
		});

		setting.properties.topicTypes = ModelSetting.defaultTopicTypes;

		return setting.save();

	}).then(setting => {


		if(project){
			project.models.push(model);
			return project.save().then(() => setting);
		}

		return setting;
		

	}).then(setting => {

		if(data.userPermissions && 
			data.userPermissions.indexOf(C.PERM_TEAMSPACE_ADMIN) === -1 && 
			data.userPermissions.indexOf(C.PERM_PROJECT_ADMIN) === -1
		){

			return setting.changePermissions([{
				user: username,
				permission: C.ADMIN_TEMPLATE
			}]).then(() => setting);

		}

		return Promise.resolve(setting);

	}).then(setting => {

		let modelData = {
			account,
			model:  model.toString(),
			name: modelName,
			permissions: C.MODEL_PERM_LIST,
			timestamp: setting.timestamp || undefined
		};

		ChatEvent.newModel(data.sessionId, account, modelData);

		// this is true if only admin can create project
		return {

			setting,
			model: modelData

		};
	});
}

function importToyProject(account, username){
	
	// create a project named Sample_Project
	return Project.createProject(username, 'Sample_Project', username, [C.PERM_TEAMSPACE_ADMIN]).then(project => {

		return Promise.all([

			importToyModel(account, username, 'Sample_House', 'Sample_House', project.name),
			importToyModel(account, username, 'Sample_Tree', 'Sample_Tree', project.name)

		]).then(models => {

			//skip some steps when importing fed models
			const skip = { tree: 1 };

			const subModels = models.map(m => {
				
				m = m.toObject();
				
				importSuccess(account, m._id);

				return {
					model: m._id,
					database: account
				};
			});

			return importToyModel(account, username, 'Sample_Federation', 'Sample_Federation', project.name, subModels, skip);
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

function importToyModel(account, username, modelName, modelDirName, project, subModels, skip){
	

	let model;
	let desc = '';
	let type = 'sample';

	//dun move the toy model instead make a copy of it
	// let copy = true;

	let data = {
		desc, type, project, unit: 'm', subModels
	};

	return createAndAssignRole(modelName, account, username, data).then(data => {
		return Promise.resolve(data.setting);
	}).then(setting => {
		model = setting._id;
		return importModel(account, model, username, setting, {type: 'toy', modelDirName, skip });
	}).catch(err => {

		Mailer.sendImportError({
			account,
			model,
			username,
			err: err.message,
			corID: err.corID,
			appId: err.appId
		});

		return Promise.reject(err);
	});
}

function createFederatedModel(account, model, subModels){

	return createCorrelationId(account, model).then(correlationId => {

		let federatedJSON = {
			database: account,
			project: model,
			subProjects: []
		};

		let error;

		let addSubModels = [];

		let files = function(data){
			return [
				{desc: 'json file', type: 'file', path: data.jsonFilename},
				{desc: 'tmp dir', type: 'dir', path: data.newFileDir}
			];
		};

		subModels.forEach(subModel => {

			if(subModel.database !== account){
				error = responseCodes.FED_MODEL_IN_OTHER_DB;
			}

			addSubModels.push(ModelSetting.findById({account, model: subModel.model}, subModel.model).then(setting => {
				if(setting && setting.federate){
					return Promise.reject(responseCodes.FED_MODEL_IS_A_FED);

				} else if(!federatedJSON.subProjects.find(o => o.database === subModel.database && o.project === subModel.model)) {
					federatedJSON.subProjects.push({
						database: subModel.database,
						project: subModel.model
					});
				}
			}));

		});

		if(error){
			return Promise.reject(error);
		}

		if(subModels.length === 0) {
			return Promise.resolve();
		}
		return Promise.all(addSubModels).then(() => {
			//return importQueue.createFederatedModel(correlationId, account, federatedJSON);
			// cclw05 - this is a temporary workaround!
			// cclw05 - genFed needs to be merged with importModel
			return importQueue.createFederatedModel(correlationId, account, federatedJSON);
			//return Promise.resolve();

		}).then(data => {

			resetCorrelationId(account, model);

			_deleteFiles(files(data));

			return;

		}).catch(err => {
			//catch here to provide custom error message
			if(err.errCode){
				return Promise.reject(convertToErrorCode(err.errCode));
			}
			return Promise.reject(err);

		});

	});
}

function getIdMap(account, model, branch, rev, username){
	'use strict'	
	let subIdMaps;
	let revId, idMapsFileName;
	let getHistory, history;
	let status;

	if(rev && utils.isUUID(rev)){
		getHistory = History.findByUID({ account, model }, rev);
	} else if (rev && !utils.isUUID(rev)) {
		getHistory = History.findByTag({ account, model }, rev);
	} else if (branch) {
		getHistory = History.findByBranch({ account, model }, branch);
	}

	return getHistory.then(_history => {
		history = _history;
		return middlewares.hasReadAccessToModelHelper(username, account, model);
	}).then(granted => {
		if(!history){
			status = 'NOT_FOUND';
			return Promise.reject(responseCodes.INVALID_TAG_NAME); 
		} else if (!granted) {
			status = 'NO_ACCESS';
			return Promise.resolve(responseCodes.NOT_AUTHORIZED);
		} else {
			revId = utils.uuidToString(history._id);
			idMapsFileName = `/${account}/${model}/revision/${revId}/idMap.json`;

			let filter = {
				type: "ref",
				_id: { $in: history.current }
			};
			return Ref.find({ account, model }, filter);
		}
	}).then(refs => {

		//for all refs get their tree
		let getIdMaps = [];

		refs.forEach(ref => {

			let refBranch, refRev;

			if (utils.uuidToString(ref._rid) === C.MASTER_BRANCH){
				refBranch = C.MASTER_BRANCH_NAME;
			} else {
				refRev = utils.uuidToString(ref._rid);
			}

			getIdMaps.push(
				getIdMap(ref.owner, ref.project, refBranch, refRev, username).then(obj => {
					return Promise.resolve({
						idMap: obj.idMaps.idMap,
						owner: ref.owner,
						model: ref.project
					})
				}).catch(err => {
					return Promise.resolve();
				})
			);
		});

		return Promise.all(getIdMaps);

	}).then(_subIdMaps => {

		subIdMaps = _subIdMaps;
		return stash.findStashByFilename({ account, model }, 'json_mpc', idMapsFileName);

	}).then(buf => {
		let idMaps = {};

		if(buf){
			idMaps = JSON.parse(buf);
		}

		if (!idMaps.idMap)
		{
			idMaps.idMap = [];
		}

		if(subIdMaps.length > 0)
		{
			idMaps.subModels = [];
		}
		subIdMaps.forEach(subIdMap => {
			// Model properties hidden nodes
			// For a federation concatenate all together in a
			// single array
			if (subIdMap && subIdMap.idMap)
			{
				idMaps.subModels.push({idMap: subIdMap.idMap, account: subIdMap.owner, model: subIdMap.model});
			}
		});

		return Promise.resolve({idMaps, status});

	});
}


function getModelProperties(account, model, branch, rev, username){
	
	let subProperties;
	let revId, modelPropertiesFileName;
	let getHistory, history;
	let status;

	if(rev && utils.isUUID(rev)){
		getHistory = History.findByUID({ account, model }, rev);
	} else if (rev && !utils.isUUID(rev)) {
		getHistory = History.findByTag({ account, model }, rev);
	} else if (branch) {
		getHistory = History.findByBranch({ account, model }, branch);
	}

	return getHistory.then(_history => {
		history = _history;
		return middlewares.hasReadAccessToModelHelper(username, account, model);
	}).then(granted => {
		if(!history){
			status = 'NOT_FOUND';
			return Promise.resolve([]);
		} else if (!granted) {
			status = 'NO_ACCESS';
			return Promise.resolve([]);
		} else {
			revId = utils.uuidToString(history._id);
			modelPropertiesFileName = `/${account}/${model}/revision/${revId}/modelProperties.json`;

			let filter = {
				type: "ref",
				_id: { $in: history.current }
			};
			return Ref.find({ account, model }, filter);
		}
	}).then(refs => {

		//for all refs get their tree
		let getModelProps = [];

		refs.forEach(ref => {

			let refBranch, refRev;

			if (utils.uuidToString(ref._rid) === C.MASTER_BRANCH){
				refBranch = C.MASTER_BRANCH_NAME;
			} else {
				refRev = utils.uuidToString(ref._rid);
			}

			getModelProps.push(
				getModelProperties(ref.owner, ref.project, refBranch, refRev, username).then(obj => {
					return Promise.resolve({
						properties: obj.properties,
						owner: ref.owner,
						model: ref.project
					});
				})
			);
		});

		return Promise.all(getModelProps);

	}).then(_subProperties => {

		subProperties = _subProperties;
		return stash.findStashByFilename({ account, model }, 'json_mpc', modelPropertiesFileName);

	}).then(buf => {
		let properties = { hiddenNodes : null };

		if(buf){
			properties = JSON.parse(buf);
		}

		if (!properties.hiddenNodes)
		{
			properties.hiddenNodes = [];
		}

		if(subProperties.length > 0)
		{
			properties.subModels = [];
		}
		subProperties.forEach(subProperty => {
			// Model properties hidden nodes
			// For a federation concatenate all together in a
			// single array

			if (subProperty.properties.hiddenNodes && subProperty.properties.hiddenNodes.length > 0)
			{
				properties.subModels.push({properties: subProperty.properties, account: subProperty.owner, model: subProperty.model});
			}
		});

		return Promise.resolve({properties, status});

	});
}

function getTreePath(account, model, branch, rev, username){
	'use strict'	
	let subTreePaths;
	let revId, treePathsFileName;
	let getHistory, history;
	let status;

	if(rev && utils.isUUID(rev)){
		getHistory = History.findByUID({ account, model }, rev);
	} else if (rev && !utils.isUUID(rev)) {
		getHistory = History.findByTag({ account, model }, rev);
	} else if (branch) {
		getHistory = History.findByBranch({ account, model }, branch);
	}

	return getHistory.then(_history => {
		history = _history;
		return middlewares.hasReadAccessToModelHelper(username, account, model);
	}).then(granted => {
		if(!history){
			status = 'NOT_FOUND';
			return Promise.reject(responseCodes.INVALID_TAG_NAME); 
		} else if (!granted) {
			status = 'NO_ACCESS';
			return Promise.resolve(responseCodes.NOT_AUTHORIZED);
		} else {
			revId = utils.uuidToString(history._id);
			treePathsFileName = `/${account}/${model}/revision/${revId}/tree_path.json`;

			let filter = {
				type: "ref",
				_id: { $in: history.current }
			};
			return Ref.find({ account, model }, filter);
		}
	}).then(refs => {

		//for all refs get their tree
		let getTreePaths = [];

		refs.forEach(ref => {

			let refBranch, refRev;

			if (utils.uuidToString(ref._rid) === C.MASTER_BRANCH){
				refBranch = C.MASTER_BRANCH_NAME;
			} else {
				refRev = utils.uuidToString(ref._rid);
			}

			getTreePaths.push(
				getTreePath(ref.owner, ref.project, refBranch, refRev, username).then(obj => {
					return Promise.resolve({
						idToPath: obj.treePaths.idToPath,
						owner: ref.owner,
						model: ref.project
					})
				}).catch(err => {
					return Promise.resolve();
				})
			);
		});

		return Promise.all(getTreePaths);

	}).then(_subTreePaths => {

		subTreePaths = _subTreePaths;
		return stash.findStashByFilename({ account, model }, 'json_mpc', treePathsFileName);

	}).then(buf => {
		let treePaths = {};

		if(buf){
			treePaths = JSON.parse(buf);
		}

		if (!treePaths.idToPath)
		{
			treePaths.idToPath = [];
		}

		if(subTreePaths.length > 0)
		{
			treePaths.subModels = [];
		}
		subTreePaths.forEach(subTreePath => {
			// Model properties hidden nodes
			// For a federation concatenate all together in a
			// single array
			if (subTreePath && subTreePath.idToPath)
			{
				treePaths.subModels.push({idToPath: subTreePath.idToPath, account: subTreePath.owner, model: subTreePath.model});
			}
		});

		return Promise.resolve({treePaths, status});

	});
}


function getUnityAssets(account, model, branch, rev, username){
	

	let subAssets;
	let revId, assetsFileName;
	let getHistory, history;
	let status;

	if(rev && utils.isUUID(rev)){
		getHistory = History.findByUID({ account, model }, rev);
	} else if (rev && !utils.isUUID(rev)) {
		getHistory = History.findByTag({ account, model }, rev);
	} else if (branch) {
		getHistory = History.findByBranch({ account, model }, branch);
	}

	return getHistory.then(_history => {
		history = _history;
		return middlewares.hasReadAccessToModelHelper(username, account, model);
	}).then(granted => {
		if(!history){
			status = 'NOT_FOUND';
			return Promise.reject(responseCodes.INVALID_TAG_NAME); 
		} else if (!granted) {
			status = 'NO_ACCESS';
			return Promise.resolve(responseCodes.NOT_AUTHORIZED);
		} else {
			revId = utils.uuidToString(history._id);
			assetsFileName = `/${account}/${model}/revision/${revId}/unityAssets.json`;

			let filter = {
				type: "ref",
				_id: { $in: history.current }
			};
			return Ref.find({ account, model }, filter);
		}
	}).then(refs => {

		//for all refs get their tree
		let getUnityProps = [];

		refs.forEach(ref => {

			let refBranch, refRev;

			if (utils.uuidToString(ref._rid) === C.MASTER_BRANCH){
				refBranch = C.MASTER_BRANCH_NAME;
			} else {
				refRev = utils.uuidToString(ref._rid);
			}

			getUnityProps.push(
				getUnityAssets(ref.owner, ref.project, refBranch, refRev, username).then(obj => {
					return Promise.resolve({
						models: obj.models,
						owner: ref.owner,
						model: ref.project
					})
				}).catch(err => {
					return Promise.resolve();
				})
			);
		});

		return Promise.all(getUnityProps);

	}).then(_subAssets => {

		subAssets = _subAssets;
		return stash.findStashByFilename({ account, model }, 'json_mpc', assetsFileName);

	}).then(buf => {
		let models = [];

		if(buf){
			let modelAssets = JSON.parse(buf);
			if(modelAssets !== null)
			{
				models.push(modelAssets);
			}

		}

		subAssets.forEach(subAsset => {
			if (subAsset && subAsset.models)
			{
				models = models.concat(subAsset.models);
			}
		});

		return Promise.resolve({models, status});

	});
}

function getUnityBundle(account, model, uid){
	

	let bundleFileName;

	bundleFileName = `/${account}/${model}/${uid}.unity3d`;

	return stash.findStashByFilename({ account, model }, 'unity3d', bundleFileName).then(buf => {
		if(!buf)
		{
			return Promise.reject(responseCodes.BUNDLE_STASH_NOT_FOUND); 
		}
		else
		{
			return Promise.resolve(buf);
		}
	});
}

// return main tree and urls of sub trees only and let frontend to do the remaining work :)
// returning a readstream for piping and a promise for error catching while streaming
function getFullTree_noSubTree(account, model, branch, rev){
	

	let getHistory;
	let history;
	let stashRs;

	if(rev && utils.isUUID(rev)){

		getHistory = History.findByUID({ account, model }, rev);

	} else if (rev && !utils.isUUID(rev)) {

		getHistory = History.findByTag({ account, model }, rev);

	} else if (branch) {

		getHistory = History.findByBranch({ account, model }, branch);
	}

	const readStreamPromise = getHistory.then(_history => {

		history = _history;

		if(!history){
			return Promise.reject(responseCodes.TREE_NOT_FOUND);
		}

		let revId = utils.uuidToString(history._id);
		let treeFileName = `/${account}/${model}/revision/${revId}/fulltree.json`;

		//return stash.findStashByFilename({ account, model }, 'json_mpc', treeFileName);
		return stash.findStashByFilename({ account, model }, 'json_mpc', treeFileName, true);

	}).then(rs => {

		//trees.mainTree = buf.toString();
		if(!rs) {
			return Promise.reject(responseCodes.TREE_NOT_FOUND);
		}

		stashRs = rs;

		return stream.PassThrough();

	});


	let pass;

	const outputingPromise = readStreamPromise.then(_pass => {

		pass = _pass;

		return new Promise(function(resolve, reject){

			pass.write('{"mainTree": ');

			stashRs.on('data', d => pass.write(d));
			stashRs.on('end', ()=> resolve());
			stashRs.on('error', err => reject(err));

		});

	}).then(() => {

		let filter = {
			type: "ref",
			_id: { $in: history.current }
		};

		return Ref.find({ account, model }, filter);

	}).then(refs => {

		pass.write(', "subTrees":[');

		return new Promise((resolve) => {

			function eachRef(refIndex){

				const ref = refs[refIndex];

				let url = `/${ref.owner}/${ref.project}/revision/master/head/fulltree.json`;

				if (utils.uuidToString(ref._rid) !== C.MASTER_BRANCH){
					url = `/${ref.owner}/${ref.project}/revision/${revId}/fulltree.json`;
				} 

				if(refIndex > 0){
					pass.write(",");
				}

				pass.write(`{"_id": "${utils.uuidToString(ref._id)}", "url": "${url}", "model": "${ref.project}"}`);

				if(refIndex+1 < refs.length){
					eachRef(refIndex+1);
				} else {
					resolve();
				}

			}

			if(refs.length){
				eachRef(0);
			} else {
				resolve();
			}
		});

	}).then(() => {

		pass.write(']');
		pass.write("}");
		pass.end();

	}).catch(err => {

		pass && pass.end();
		return Promise.reject(err);

	});

	return {readStreamPromise, outputingPromise};
}

function searchTree(account, model, branch, rev, searchString, username){
	

	let items = [];

	let search = (history) => {

		let filter = {
			_id: {'$in': history.current },
			name: new RegExp(searchString, 'i')
		};

		return Scene.find({account, model}, filter, { name: 1 }).then(objs => {

			objs.forEach((obj, i) => {

				objs[i] = obj.toJSON();
				objs[i].account = account;
				objs[i].model = model;
				items.push(objs[i]);

			});

			let filter = {
				_id: {'$in': history.current },
				type: 'ref'
			};

			return Ref.find({account, model}, filter);

		}).then(refs => {

			let promises = [];

			refs.forEach(ref => {

				let refRev, refBranch;

				if(utils.uuidToString(ref._rid) === C.MASTER_BRANCH){
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

		if(granted){

			let getHistory;

			if(rev && utils.isUUID(rev)){
				getHistory = History.findByUID({account, model}, rev);
			} else if (rev && !utils.isUUID(rev)){
				getHistory = History.findByTag({account, model}, rev);
			} else {
				getHistory = History.findByBranch({account, model}, branch);
			}

			return getHistory.then(history => {
				if(history){
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

function listSubModels(account, model, branch){
	

	let subModels = [];

	return History.findByBranch({ account, model }, branch).then(history => {

		if(history){
			let filter = {
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


function downloadLatest(account, model){
	
	let bucket =  stash.getGridFSBucket(account, `${model}.history`);

	return bucket.find({}, {sort: { uploadDate: -1}}).next().then(file => {

		if(!file){
			return Promise.reject(responseCodes.NO_FILE_FOUND);
		}

		// change file name
		let filename = file.filename.split('_');
		let ext = '';

		if (filename.length > 1){
			ext = '.' + filename.pop();
		}

		file.filename = filename.join('_').substr(36) + ext;

		return Promise.resolve({
			readStream: bucket.openDownloadStream(file._id),
			meta: file
		});

	});
}


function uploadFile(req){
	
	if (!config.cn_queue) {
		return Promise.reject(responseCodes.QUEUE_NO_CONFIG);
	}

	let account = req.params.account;
	let model = req.params.model;

	ChatEvent.modelStatusChanged(null, account, model, { status: 'uploading' });
	//upload model with tag
	let checkTag = tag => {
		if(!tag){
			return Promise.resolve();
		} else {
			return (tag.match(History.tagRegExp) ? Promise.resolve() : Promise.reject(responseCodes.INVALID_TAG_NAME)).then(() => {
				return History.findByTag({account, model}, tag, {_id: 1});
			}).then(tag => {
				if (!tag){
					return Promise.resolve();
				} else {
					return Promise.reject(responseCodes.DUPLICATE_TAG);
				}
			});

		}
	};

	return new Promise((resolve, reject) => {

		let upload = multer({
			dest: config.cn_queue.upload_dir,
			fileFilter: function(req, file, cb){

				let format = file.originalname.split('.');

				if(format.length <= 1){
					return cb({resCode: responseCodes.FILE_NO_EXT});
				}

				format = format[format.length - 1];

				let size = parseInt(req.headers['content-length']);

				if(acceptedFormat.indexOf(format.toLowerCase()) === -1){
					return cb({resCode: responseCodes.FILE_FORMAT_NOT_SUPPORTED });
				}

				if(size > config.uploadSizeLimit){
					return cb({ resCode: responseCodes.SIZE_LIMIT });
				}

				middlewares.freeSpace(account).then(space => {

					if(size > space){
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

			} else if(!req.file.size){
				return reject(responseCodes.FILE_FORMAT_NOT_SUPPORTED);

			} else {
				ChatEvent.modelStatusChanged(null, account, model, { status: 'uploaded' });
				return resolve(req.file);
			}
		});

	}).then(file => {
		return checkTag(req.body.tag).then(() => file);
	});

}

function _deleteFiles(files){
	
	files.forEach(file => {

		let deleteFile = (file.type === 'file' ? fs.unlink : fs.rmdir);

		deleteFile(file.path, function(err){
			if(err){
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
function _handleUpload(correlationId, account, model, username, file, data){
	
	let files = function(filePath, fileDir, jsonFile){
		return [
			{desc: 'tmp model file', type: 'file', path: filePath},
			{desc: 'json file', type: 'file', path: jsonFile},
			{desc: 'tmp dir', type: 'dir', path: fileDir}
		];
	};

	importQueue.importFile(
		correlationId,
		file.path,
		file.originalname,
		account,
		model,
		username,
		null,
		data.tag,
		data.desc
	).then(obj => {

		systemLogger.logInfo(`Job ${correlationId} imported without error`,{
			account,
			model,
			username
		});

		_deleteFiles(files(obj.newPath, obj.newFileDir, obj.jsonFilename));

	}).catch(err => {
		systemLogger.logError(`Failed to import model:`, err);
	});

}

function importModel(account, model, username, modelSetting, source, data){

	if(!modelSetting){
		return Promise.reject({ message: `modelSetting is ${modelSetting}`});
	}

	return modelSetting.save().then(() => {
		return createCorrelationId(account, model).then(correlationId => {
			return setStatus(account, model, 'queued').then(setting => {

				modelSetting = setting;

				if (source.type === 'upload'){
					return _handleUpload(correlationId, account, model, username, source.file, data);

				} else if (source.type === 'toy'){

					return importQueue.importToyModel(correlationId, account, model, source).then(obj => {
						systemLogger.logInfo(`Job ${modelSetting.corID} imported without error`,{account, model, username});
						return modelSetting;
					});
				}

			});
		});
	});

}

function removeModel(account, model, forceRemove){
	

	let setting;
	return ModelSetting.findById({account, model}, model).then(_setting => {

		setting = _setting;

		if(!setting){
			return Promise.reject({resCode: responseCodes.MODEL_NOT_FOUND});
		}

		return ModelSetting.find({ account, model}, { federate: true });

	}).then(settings => {

		let promises = [];

		settings.forEach(modelSetting => {
			!forceRemove && promises.push(listSubModels(account, modelSetting._id).then(subModels => {
				if(subModels.find(subModel => subModel.model === model)) {
					return Promise.reject(responseCodes.MODEL_IS_A_SUBMODEL);
				}
			}));
		});

		return Promise.all(promises);

	}).then(() => {
		
		return ModelFactory.db.db(account).listCollections().toArray();

	}).then(collections => {
		//remove model collections

		let promises = [];

		collections.forEach(collection => {
			if(collection.name.startsWith(model + '.')){
				promises.push(ModelFactory.db.db(account).dropCollection(collection.name));
			}
		});

		return Promise.all(promises);

	}).then(() => {
		//remove model settings
		return setting.remove();

	}).then(() => {

		//remove model from all project
		return Project.removeModel(account, model);
	});

}

function getModelPermission(username, setting, account){
	

	if(!setting){
		return Promise.resolve([]);
	}

	let permissions = [];
	let dbUser;

	return User.findByUserName(account).then(_dbUser => {

		dbUser = _dbUser;

		if(!dbUser){
			return [];
		}

		const accountPerm = dbUser.customData.permissions.findByUser(username);

		if(accountPerm && accountPerm.permissions){
			permissions = _.compact(_.flatten(accountPerm.permissions.map(p => C.IMPLIED_PERM[p] && C.IMPLIED_PERM[p].model || null)));
		}

		const projectQuery = { models: setting._id, 'permissions.user': username };
		// project admin have access to models underneath it.
		return Project.findOne({account}, projectQuery, { 'permissions.$' : 1 });

	}).then(project => {

		if(project && project.permissions){
			permissions = permissions.concat(
				_.compact(_.flatten(project.permissions[0].permissions.map(p => C.IMPLIED_PERM[p] && C.IMPLIED_PERM[p].model || null)))
			);
		}

		const template = setting.findPermissionByUser(username);

		if(template){

			const permission = dbUser.customData.permissionTemplates.findById(template.permission);

			if(permission && permission.permissions){
				permissions = permissions.concat(
					_.flatten(permission.permissions.map(p => C.IMPLIED_PERM[p] && C.IMPLIED_PERM[p].model || p))
				);
			}
		}

		return _.uniq(permissions);
	});
}

function getAllIdsWith4DSequenceTag(account, model, branch, rev){
	//Get sequence tag then call the generic getAllIdsWithMetadataField
	return ModelSetting.findOne({account : account}, {_id : model}).then(settings => {
		if(!settings)
		{
			return Promise.reject(responseCodes.MODEL_NOT_FOUND);
		}
		if(!settings.fourDSequenceTag)
		{
			return Promise.reject(responseCodes.SEQ_TAG_NOT_FOUND);
		}
		return getAllIdsWithMetadataField(account, model,  branch, rev, settings.fourDSequenceTag);

	});
}

function getAllIdsWithMetadataField(account, model, branch, rev, fieldName, username){
	//Get the revision object to find all relevant IDs
	let getHistory;
	let history;
	let fullFieldName = "metadata." + fieldName;

	if(rev && utils.isUUID(rev)){
		getHistory = History.findByUID({ account, model }, rev);
	} else if (rev && !utils.isUUID(rev)) {
		getHistory = History.findByTag({ account, model }, rev);
	} else if (branch) {
		getHistory = History.findByBranch({ account, model }, branch);
	}
	return getHistory.then(_history => {
		history = _history;
		if(!history){
			return Promise.reject(responseCodes.METADATA_NOT_FOUND);
		}
		//Check for submodel references
		let revId = utils.uuidToString(history._id);
		let filter = {
			type: "ref",
			_id: { $in: history.current }
		};
		return Ref.find({ account, model }, filter);
	}).then(refs =>{

		//for all refs get their tree
		let getMeta = [];

		refs.forEach(ref => {

			let refBranch, refRev;

			if (utils.uuidToString(ref._rid) === C.MASTER_BRANCH){
				refBranch = C.MASTER_BRANCH_NAME;
			} else {
				refRev = utils.uuidToString(ref._rid);
			}

			getMeta.push(
				getAllIdsWithMetadataField(ref.owner, ref.project, refBranch, refRev, fieldName, username).then(obj => {
					return Promise.resolve({
						data: obj.data,
						account: ref.owner,
						model: ref.project
					});
				})
			);
		});

		return Promise.all(getMeta);

	}).then(_subMeta => {

		let match = {
			_id: {"$in": history.current},
		}
		match[fullFieldName] =  {"$exists" : true};

		let projection = {
			parents: 1
		};
		projection[fullFieldName] = 1;

		return Scene.find({account, model}, match, projection).then(obj => {
			if(obj){
				//rename fieldName to "value"
				let parsedObj = {data: obj};
				if(obj.length > 0)
				{
					const objStr = JSON.stringify(obj);
					parsedObj.data = JSON.parse(objStr.replace(new RegExp(fieldName, 'g'), "value"))
				}
				if(_subMeta.length > 0){
					parsedObj.subModels = _subMeta;
				}
				return parsedObj;
			} else {
				return Promise.reject(responseCodes.METADATA_NOT_FOUND);
			}
		});

	});




}

function getMetadata(account, model, id){
	

	let projection = {
		shared_id: 0,
		paths: 0,
		type: 0,
		api: 0,
		parents: 0
	};

	return Scene.findOne({account, model}, { _id: utils.stringToUUID(id) }, projection).then(obj => {
		if(obj){
			return obj;
		} else {
			return Promise.reject(responseCodes.METADATA_NOT_FOUND);
		}
	});

}

function isUserAdmin(account, model, user)
{
	const projection = { 'permissions': { '$elemMatch': { user: user } }};
	//find the project this model belongs to
	return Project.findOne({account}, {models: model}, projection).then(project => {
		//It either has no permissions, or it has one entry (the user) due to the project in the query
		return Promise.resolve(
			project  //This model belongs to a project
			&& project.permissions.length > 0 //This user has project level permissions in the project
			&& project.permissions[0].permissions.indexOf(C.PERM_PROJECT_ADMIN) > -1 //This user is an admin of the project
			);
	});
}

const fileNameRegExp = /[ *"\/\\[\]:;|=,<>$]/g;
const modelNameRegExp = /^[\x00-\x7F]{1,120}$/;
const acceptedFormat = [
	'x','obj','3ds','md3','md2','ply',
	'mdl','ase','hmp','smd','mdc','md5',
	'stl','lxo','nff','raw','off','ac',
	'bvh','irrmesh','irr','q3d','q3s','b3d',
	'dae','ter','csm','3d','lws','xml','ogex',
	'ms3d','cob','scn','blend','pk3','ndo',
	'ifc','xgl','zgl','fbx','assbin', 'bim'
];


module.exports = {
	createAndAssignRole,
	importToyModel,
	importToyProject,
	isUserAdmin,
	createFederatedModel,
	listSubModels,
	getIdMap,
	getModelProperties,
	getTreePath,
	getUnityAssets,
	getUnityBundle,
	searchTree,
	downloadLatest,
	fileNameRegExp,
	modelNameRegExp,
	acceptedFormat,
	uploadFile,
	importModel,
	removeModel,
	getModelPermission,
	getMetadata,
	getFullTree_noSubTree,
	setStatus,
	resetCorrelationId,
   	getAllIdsWith4DSequenceTag,
	getAllIdsWithMetadataField,
	setStatus,
	importSuccess,
	importFail
};
