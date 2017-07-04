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
var ModelFactory = require('../factory/modelFactory');
var Role = require('../role');
var RoleTemplates = require('../role_templates');
var ModelSetting = require('../modelSetting');
var User = require('../user');
var responseCodes = require('../../response_codes');
var importQueue = require('../../services/queue');
var C = require('../../constants');
var Mailer = require('../../mailer/mailer');
var systemLogger = require("../../logger.js").systemLogger;
var config = require('../../config');
var History = require('../history');
var Scene = require('../scene');
var Ref = require('../ref');
var utils = require("../../utils");
var stash = require('./stash');
var Ref = require('../ref');
var middlewares = require('../../routes/middlewares');
var C = require("../../constants");
var multer = require("multer");
var fs = require('fs');
var ChatEvent = require('../chatEvent');
var Project = require('../project');

/*******************************************************************************
 * Converts error code from repobouncerclient to a response error object
 * @param {errCode} - error code referenced in error_codes.h
 *******************************************************************************/
function convertToErrorCode(errCode){

    var errObj;

    switch (errCode) {
        case 0:
            errObj = responseCodes.OK;
            break;
        case 1:
            errObj = responseCodes.FILE_IMPORT_INVALID_ARGS;
            break;
        case 2:
            errObj = responseCodes.NOT_AUTHORIZED;
            break;
        case 3:
            errObj = responseCodes.FILE_IMPORT_UNKNOWN_CMD;
            break;
        case 5:
            errObj = responseCodes.FILE_IMPORT_PROCESS_ERR;
			break;
        case 6:
            errObj = responseCodes.FILE_IMPORT_STASH_GEN_FAILED;
			break;
        case 7:
            errObj = responseCodes.FILE_IMPORT_MISSING_TEXTURES;
            break;
        case 9:
        	errObj = responseCodes.REPOERR_FED_GEN_FAIL;
        	break;
		case 10:
			errObj = responseCodes.FILE_IMPORT_MISSING_NODES;
			break;
		default:
            errObj = responseCodes.FILE_IMPORT_UNKNOWN_ERR;
            break;

    }
    return errObj;
}


function createAndAssignRole(modelName, account, username, data) {
	'use strict';

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
		
		return ModelSetting.count({account, model}, {name: modelName, _id: { '$in' : project.models} });

	}).then(count => {

		if(count){
			return Promise.reject({resCode: responseCodes.MODEL_EXIST});
		}

		return (data.subModels ? createFederatedModel(account, model, data.subModels) : Promise.resolve());

	}).then(() => {

		return Role.createStandardRoles(account, model);

	}).then(() => {

		return Role.grantModelRoleToUser(username, account, model, C.COLLABORATOR_TEMPLATE);

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
			permissions: C.MODEL_PERM_LIST
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
	'use strict';
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
	'use strict';

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
	'use strict';

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

	//console.log(federatedJSON);
	return Promise.all(addSubModels).then(() => {

		return importQueue.createFederatedModel(account, federatedJSON).catch(err => {
			_deleteFiles(files(err));
			return;
		});

	}).then(data => {


		_deleteFiles(files(data));

		return;

	}).catch(err => {
		//catch here to provide custom error message
		if(err.errCode){
			return Promise.reject(convertToErrorCode(err.errCode));
		}
		return Promise.reject(err);

	});

}

function getModelProperties(account, model, branch, rev, username){
	'use strict';

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

function getUnityAssets(account, model, branch, rev, username){
	'use strict';

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
			return Promise.resolve([]);
		} else if (!granted) {
			status = 'NO_ACCESS';
			return Promise.resolve([]);
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
					});
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
			if (subAsset.models)
			{
				models = models.concat(subAsset.models);
			}
		});

		return Promise.resolve({models, status});

	});
}

function getUnityBundle(account, model, uid){
	'use strict';

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

// tree main tree and urls of sub trees only and let frontend to do the remaining work :)
function getFullTree_noSubTree(account, model, branch, rev, username, out){
	'use strict';

	let getHistory;
	let history;

	out.write("{");

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
			return Promise.reject(responseCodes.TREE_NOT_FOUND);
		}

		let revId = utils.uuidToString(history._id);
		let treeFileName = `/${account}/${model}/revision/${revId}/fulltree.json`;

		//return stash.findStashByFilename({ account, model }, 'json_mpc', treeFileName);
		return stash.findStashByFilename({ account, model }, 'json_mpc', treeFileName, true);

	}).then(rs => {

		//trees.mainTree = buf.toString();

		return new Promise(function(resolve, reject){

			out.write('"mainTree": ');

			rs.on('data', d => out.write(d));
			rs.on('end', ()=> resolve());
			rs.on('error', err => reject(err));

		});

	}).then(() => {

		let filter = {
			type: "ref",
			_id: { $in: history.current }
		};

		return Ref.find({ account, model }, filter);

	}).then(refs => {

		//for all refs get their tree
		out.write(', "subTrees":[');

		return new Promise((resolve) => {

			function eachRef(refIndex){

				const ref = refs[refIndex];
				//write buffer
				//done
				let url = `/${ref.owner}/${ref.project}/revision/master/head/fulltree.json`;

				if (utils.uuidToString(ref._rid) !== C.MASTER_BRANCH){
					url = `/${ref.owner}/${ref.project}/revision/${revId}/fulltree.json`;
				} 

				if(refIndex > 0){
					out.write(",");
				}

				out.write(`{"_id": "${utils.uuidToString(ref._id)}", "url": "${url}"}`);

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

		out.write(']');
		out.write("}");
		out.end();

	});
}

// more efficient, no json parsing, no idToPath generation for fed model, but only support 1 level of fed
function getFullTree(account, model, branch, rev, username, out){
	'use strict';

	let getHistory;
	let history;
	//let trees = {};
	out.write("{");

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
			return Promise.reject(responseCodes.TREE_NOT_FOUND);
		}

		let revId = utils.uuidToString(history._id);
		let treeFileName = `/${account}/${model}/revision/${revId}/fulltree.json`;

		//return stash.findStashByFilename({ account, model }, 'json_mpc', treeFileName);
		return stash.findStashByFilename({ account, model }, 'json_mpc', treeFileName, true);

	}).then(rs => {

		//trees.mainTree = buf.toString();

		return new Promise(function(resolve, reject){

			out.write('"mainTree": ');

			rs.on('data', d => out.write(d));
			rs.on('end', ()=> resolve());
			rs.on('error', err => reject(err));

		});

	}).then(() => {
		let filter = {
			type: "ref",
			_id: { $in: history.current }
		};

		return Ref.find({ account, model }, filter);

	}).then(refs => {

		//for all refs get their tree
		out.write(', "subTrees":[');

		return new Promise((resolve, reject) => {

			function eachRef(refIndex){

				const ref = refs[refIndex];
				//write buffer
				//done
				let getRefId;

				if (utils.uuidToString(ref._rid) === C.MASTER_BRANCH){

					getRefId = History.findByBranch({ account: ref.owner, model: ref.project }, C.MASTER_BRANCH_NAME).then(_history => {
						return _history ? utils.uuidToString(_history._id) : null;
					});

				} else {
					getRefId = Promise.resolve(utils.uuidToString(ref._rid));
				}

				let status;
				middlewares.hasReadAccessToModelHelper(username, ref.owner, ref.project).then(granted => {

					if(!granted){
						status = 'NO_ACCESS';
						return;
					}

					return getRefId.then(revId => {

						if(!revId){
							status = 'NOT_FOUND';
							return;
						}

						let treeFileName = `/${ref.owner}/${ref.project}/revision/${revId}/fulltree.json`;
						//return stash.findStashByFilename({ account: ref.owner, model: ref.project }, 'json_mpc', treeFileName);
						return stash.findStashByFilename({ account: ref.owner, model: ref.project }, 'json_mpc', treeFileName, true);
					});

				}).then(rs => {

					return new Promise(function(_resolve, _reject){

						if(refIndex > 0){
							out.write(",");
						}

						let statusString = status && `"status": "${status}" ,` || '';

						out.write(`{ ${statusString} "_id": "${utils.uuidToString(ref._id)}", "buf": `);

						rs.on('data', d => out.write(d));
						rs.on('end', () => {
							out.write('}');
							_resolve();
						});
						rs.on('error', err => _reject(err));

					});

				}).then(() => {
					if(refIndex+1 < refs.length){
						eachRef(refIndex+1);
					} else {
						resolve();
					}
				}).catch(err => {
					reject(err);
				});
			}

			if(refs.length){
				eachRef(0);
			} else {
				resolve();
			}
		});


	}).then(() => {

		out.write(']');
		out.write("}");
		out.end();

	});
}

function searchTree(account, model, branch, rev, searchString, username){
	'use strict';

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
	'use strict';

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

		refs.forEach(ref => {
			subModels.push({
				database: ref.owner,
				model: ref.project
			});
		});

		return Promise.resolve(subModels);

	});
}


function downloadLatest(account, model){
	'use strict';

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
	'use strict';

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
	'use strict';

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

function _handleUpload(account, model, username, file, data){
	'use strict';


	let files = function(filePath, fileDir, jsonFile){
		return [
			{desc: 'tmp model file', type: 'file', path: filePath},
			{desc: 'json file', type: 'file', path: jsonFile},
			{desc: 'tmp dir', type: 'dir', path: fileDir}
		];
	};

	return importQueue.importFile(
		file.path,
		file.originalname,
		account,
		model,
		username,
		null,
		data.tag,
		data.desc
	).then(obj => {

		let corID = obj.corID;

		systemLogger.logInfo(`Job ${corID} imported without error`,{
			account,
			model,
			username
		});

		_deleteFiles(files(obj.newPath, obj.newFileDir, obj.jsonFilename));
		return Promise.resolve(obj);

	}).catch(err => {
		_deleteFiles(files(err.newPath, err.newFileDir, err.jsonFilename));
		return err.errCode ? Promise.reject(convertToErrorCode(err.errCode)) : Promise.reject(err);
	});

}

function importModel(account, model, username, modelSetting, source, data){
	'use strict';

	if(!modelSetting){
		return Promise.reject({ message: `modelSetting is ${modelSetting}`});
	}

	ChatEvent.modelStatusChanged(null, account, model, { status: 'processing' });

	modelSetting.status = 'processing';

	return modelSetting.save().then(() => {

		if (source.type === 'upload'){
			return _handleUpload(account, model, username, source.file, data);

		} else if (source.type === 'toy'){

			return importQueue.importToyModel(account, model, source).then(obj => {
				let corID = obj.corID;
				systemLogger.logInfo(`Job ${corID} imported without error`,{account, model, username});
			});
		}

	}).then(() => {

		modelSetting.status = 'ok';
		modelSetting.errorReason = undefined;
		modelSetting.timestamp = new Date();
		modelSetting.markModified('errorReason');

		ChatEvent.modelStatusChanged(null, account, model, modelSetting);

		return modelSetting.save();

	}).then(() => {

		systemLogger.logInfo(`Model from source ${source.type} has imported successfully`, {
			account,
			model,
			username
		});

		return modelSetting;

	}).catch(err => {

		// import failed for some reason(s)...
		//mark model failed

		systemLogger.logError(`Error while importing model from source ${source.type}`, {
			stack : err.stack,
			err: err,
			account,
			model,
			username
		});

		modelSetting.status = 'failed';
		modelSetting.errorReason = err;
		modelSetting.markModified('errorReason');
		modelSetting.save();

		ChatEvent.modelStatusChanged(null, account, model, modelSetting);


		return Promise.reject(err);

	});
}

function removeModel(account, model, forceRemove){
	'use strict';

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
				if(subModels.find(subModel => subModel.model === model)){
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
		//remove roles related to this model from system.roles collection
		let promises = [];

		RoleTemplates.modelRoleTemplateLists.forEach(role => {
			promises.push(Role.dropRole(account, `${model}.${role}`));
		});

		return Promise.all(promises);
	}).then(() => {

		//remove model from all project
		return Project.removeModel(account, model);
	}).then(() => {

		//remove model from collaborator.customData.models
		return User.removeModelFromAllUser(account, model);
	});

}

function getModelPermission(username, setting, account){
	'use strict';

	if(!setting){
		return Promise.resolve([]);
	}

	return User.findByUserName(account).then(dbUser => {
		if(!dbUser){
			return [];
		}

		const accountPerm = dbUser.customData.permissions.findByUser(username);

		if(accountPerm && accountPerm.permissions.indexOf(C.PERM_TEAMSPACE_ADMIN) !== -1){
			return C.MODEL_PERM_LIST;
		}

		const template = setting.findPermissionByUser(username);

		if(!template){
			return Promise.resolve([]);
		}

		const permission = dbUser.customData.permissionTemplates.findById(template.permission);

		if(!permission || !permission.permissions){
			return [];
		}

		return permission.permissions;
	});
}

function getMetadata(account, model, id){
	'use strict';

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

var fileNameRegExp = /[ *"\/\\[\]:;|=,<>$]/g;
var modelNameRegExp = /^[a-zA-Z0-9_\-]{3,20}$/;
var acceptedFormat = [
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
	convertToErrorCode,
	createFederatedModel,
	listSubModels,
	getFullTree,
	getModelProperties,
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
	getFullTree_noSubTree
};
