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

var express = require('express');
var router = express.Router({mergeParams: true});
var config = require("../config.js");
// var _ = require('lodash');
var utils = require('../utils');
var middlewares = require('./middlewares');
var ProjectSetting = require('../models/projectSetting');
var responseCodes = require('../response_codes');
var C = require("../constants");
var importQueue = require('../services/queue');
var multer = require("multer");
var ProjectHelpers = require('../models/helper/project');
var createAndAssignRole = ProjectHelpers.createAndAssignRole;
var convertToErrorCode = ProjectHelpers.convertToErrorCode;
var fs = require('fs');
var systemLogger = require("../logger.js").systemLogger;
var History = require('../models/history');


var getDbColOptions = function(req){
	return {account: req.params.account, project: req.params.project};
};


// bid4free exclusive api get project info
router.get('/:project/info.json', hasReadProjectInfoAccess, B4F_getProjectSetting);
//  bid4free exclusive api update project info
router.post('/:project/info.json', middlewares.isMainContractor, B4F_updateProjectSetting);

// Get project info
router.get('/:project.json', middlewares.hasReadAccessToProject, getProjectSetting);

router.put('/:project/settings', middlewares.hasWriteAccessToProject, updateSettings);

router.post('/:project', middlewares.connectQueue, middlewares.canCreateProject, createProject);

//update federated project
router.put('/:project', middlewares.connectQueue, middlewares.hasWriteAccessToProject, updateProject);

//master tree
router.get('/:project/revision/master/head/fulltree.json', middlewares.hasReadAccessToProject, getProjectTree);

router.get('/:project/revision/:rev/fulltree.json', middlewares.hasReadAccessToProject, getProjectTree);

//search master tree
router.get('/:project/revision/master/head/searchtree.json', middlewares.hasReadAccessToProject, searchProjectTree);

router.get('/:project/revision/:rev/searchtree.json', middlewares.hasReadAccessToProject, searchProjectTree);

router.delete('/:project', middlewares.canCreateProject, deleteProject);

router.post('/:project/upload', middlewares.connectQueue, middlewares.canCreateProject, uploadProject);

router.get('/:project/collaborators', middlewares.isAccountAdmin, listCollaborators);

router.post('/:project/collaborators', middlewares.isAccountAdmin, middlewares.hasCollaboratorQuota, addCollaborator);

router.delete('/:project/collaborators', middlewares.isAccountAdmin, removeCollaborator);

router.get('/:project/download/latest', middlewares.hasReadAccessToProject, downloadLatest);

function estimateImportedSize(format, size){
	// if(format === 'obj'){
	// 	return size * 5;
	// } else {
	// 	return size * 3;
	// }
	return size;
}

function updateSettings(req, res, next){
	'use strict';


	let place = utils.APIInfo(req);
	let dbCol =  {account: req.params.account, project: req.params.project, logger: req[C.REQ_REPO].logger};

	return ProjectSetting.findById(dbCol, req.params.project).then(projectSetting => {
		projectSetting.updateProperties(req.body);
		return projectSetting.save();
	}).then(projectSetting => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, projectSetting);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}


function _getProject(req){
	'use strict';

	return ProjectSetting.findById(getDbColOptions(req), req.params.project).then(setting => {
		if(!setting){
			return Promise.reject({ resCode: responseCodes.PROJECT_INFO_NOT_FOUND});
		} else {
			return Promise.resolve(setting);
		}
	});
}

function B4F_getProjectSetting(req, res, next){
	'use strict';

	let place = '/:account/:project/info.json GET';
	_getProject(req).then(setting => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, setting.info);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function B4F_updateProjectSetting(req, res, next){
	'use strict';

	let place = '/:account/:project/info.json POST';

	ProjectSetting.findById(getDbColOptions(req), req.params.project).then(setting => {

		if(!setting){
			setting = ProjectSetting.createInstance(getDbColOptions(req));
			setting._id = req.params.project;
		}
		return Promise.resolve(setting);

	}).then(setting => {

		let whitelist = [
			'name',
			'site',
			'code',
			'client',
			'budget',
			'completedBy',
			'contact'
		];

		setting.info = setting.info || {};
		setting.info = utils.writeCleanedBodyToModel(whitelist, req.body, setting.info);
		return setting.save();

	}).then(setting => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, setting.info);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function hasReadProjectInfoAccess(req, res, next){

	middlewares.checkRole([/*C.REPO_ROLE_SUBCONTRACTOR, */C.REPO_ROLE_MAINCONTRACTOR], req).then((/*roles*/) => {
		// if role is maincontractor then no more check is needed
		return Promise.resolve();
	}).catch(() => {
		return middlewares.isSubContractorInvitedHelper(req);
	}).then(() => {
		next();
	}).catch(resCode => {
		responseCodes.respond("Middleware: check has read access", req, res, next, resCode, null, req.params);
	});
}

function getProjectSetting(req, res, next){
	'use strict';

	let place = utils.APIInfo(req);
	_getProject(req).then(setting => {

		let whitelist = ['owner', 'desc', 'type', 'permissions', 'properties', 'status', 'errorReason'];
		let resObj = {};
		
		whitelist.forEach(key => {
			resObj[key] = setting[key];
		});

		responseCodes.respond(place, req, res, next, responseCodes.OK, resObj);
		
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}



function createProject(req, res, next){
	'use strict';
	
	let responsePlace = utils.APIInfo(req);
	let project = req.params.project;
	let account = req.params.account;
	let username = req.session.user.username;

	let federate;
	if(req.body.subProjects){
		federate = true;
	}

	createAndAssignRole(project, account, username, req.body.desc, req.body.type, req.body.unit, req.body.subProjects, federate).then(() => {
		responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { account, project });
	}).catch( err => {
		responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function updateProject(req, res, next){
	'use strict';

	let responsePlace = utils.APIInfo(req);
	let project = req.params.project;
	let account = req.params.account;

	let promise = Promise.resolve();
	
	if(req.body.subProjects && req.body.subProjects.length > 0){

		promise = ProjectSetting.findById({account}, project).then(setting => {
			
			if(!setting) {
				return Promise.reject(responseCodes.PROJECT_NOT_FOUND);
			} else if (!setting.federate){
				return Promise.reject(responseCodes.PROJECT_IS_NOT_A_FED);
			} else {
				return ProjectHelpers.createFederatedProject(account, project, req.body.subProjects);
			}
		});

	}

	promise.then(() => {
		responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { account, project });
	}).catch( err => {
		responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function deleteProject(req, res, next){
	'use strict';

	let responsePlace = utils.APIInfo(req);
	let project = req.params.project;
	let account = req.params.account;

	//delete
	ProjectSetting.removeProject(account, project).then(() => {
		responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { account, project });
	}).catch( err => {
		responseCodes.respond(responsePlace, req, res, next, err.resCode || err, err.resCode ? {} : err);
	});
}




function uploadProject(req, res, next){
	'use strict';

	let responsePlace = utils.APIInfo(req);

	//check space
	function fileFilter(req, file, cb){

		let acceptedFormat = ProjectHelpers.acceptedFormat;

		let format = file.originalname.split('.');
		
		if(format.length <= 1){
			return cb({resCode: responseCodes.FILE_NO_EXT});
		}

		format = format[format.length - 1];

		let size = estimateImportedSize(format, parseInt(req.headers['content-length']));

		if(acceptedFormat.indexOf(format.toLowerCase()) === -1){
			return cb({resCode: responseCodes.FILE_FORMAT_NOT_SUPPORTED });
		}

		if(size > config.uploadSizeLimit){
			return cb({ resCode: responseCodes.SIZE_LIMIT });
		}

		middlewares.freeSpace(req.params.account).then(space => {

			// console.log('est upload file size', size);
			// console.log('space left', space);

			if(size > space){
				cb({ resCode: responseCodes.SIZE_LIMIT_PAY });
			} else {
				cb(null, true);
			}
		});

	}

	if (config.cn_queue) {

		var upload = multer({ 
			dest: config.cn_queue.upload_dir,
			fileFilter: fileFilter,
		});

		upload.single("file")(req, res, function (err) {
			if (err) {
				return responseCodes.respond(responsePlace, req, res, next, err.resCode ? err.resCode : err , err.resCode ?  err.resCode : err);
			
			} else if(!req.file.size){
				return responseCodes.respond(responsePlace, req, res, next, responseCodes.FILE_FORMAT_NOT_SUPPORTED, responseCodes.FILE_FORMAT_NOT_SUPPORTED);
			
			} else if(req.body.tag && !req.body.tag.match(History.tagRegExp)){
				return responseCodes.respond(responsePlace, req, res, next, responseCodes.INVALID_TAG_NAME, responseCodes.INVALID_TAG_NAME);
			
			} else {

				let projectSetting;

				let project = req.params.project;
				let account = req.params.account;
				//let username = req.session.user.username;

				//check dup tag first

				(req.body.tag ? History.findByTag({account, project}, req.body.tag, {_id: 1}) : Promise.resolve()).then(tag => {
					
					if(tag){
						responseCodes.respond(responsePlace, req, res, next, responseCodes.DUPLICATE_TAG, responseCodes.DUPLICATE_TAG);
						return Promise.reject(responseCodes.DUPLICATE_TAG);
					} else {
						return ProjectSetting.findById({account, project}, project);
					}

				}).then(setting => {

					if(!setting){
						responseCodes.respond(responsePlace, req, res, next, responseCodes.PROJECT_NOT_FOUND, responseCodes.PROJECT_NOT_FOUND);
						return Promise.reject(responseCodes.PROJECT_NOT_FOUND);
					}

					projectSetting = setting;
					projectSetting.status = 'processing';
					return projectSetting.save();

				}).then(() => {

					// api respond once the file is uploaded
					responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { status: 'uploaded'});

					let deleteFiles = function(filePath, fileDir, jsonFile){
						fs.unlink(filePath, function(err){
							if(err){
								systemLogger.logError('error while deleting tmp model file',{
									message: err.message,
									err: err,
									file: filePath
								});
							} else {
								systemLogger.logInfo('tmp model deleted',{
									file: filePath
								});
							}
						});

						fs.unlink(jsonFile, function(err){
							if(err){
								systemLogger.logError('error while deleting json file',{
									message: err.message,
									err: err,
									file: jsonFile
								});
							} else {
								systemLogger.logInfo('json file deleted',{
									file: jsonFile
								});
							}
						});

						fs.rmdir(fileDir, function(err){
							if(err){
								systemLogger.logError('error while tmp dir',{
									message: err.message,
									err: err,
									file: fileDir
								});
							} else {
								systemLogger.logInfo('tmp dir deleted',{
									file: fileDir
								});
							}
						});
					};

					return importQueue.importFile(
						req.file.path, 
						req.file.originalname, 
						req.params.account,
						req.params.project,
						req.session.user.username,
						null,
						req.body.tag,
						req.body.desc
					)
					.then(obj => {

						deleteFiles(obj.newPath, obj.newFileDir, obj.jsonFilename);
						return Promise.resolve(obj);

					}).catch(err => {

						deleteFiles(err.newPath, err.newFileDir, err.jsonFilename);

						//catch here to provide custom error message
						if(err.errCode && projectSetting){
							projectSetting.errorReason = convertToErrorCode(err.errCode);
							projectSetting.markModified('errorReason');
							return Promise.reject(convertToErrorCode(err.errCode));
						}


						return Promise.reject(err);
						
					});

				}).then(obj => {

					let corID = obj.corID;

					req[C.REQ_REPO].logger.logInfo(`Job ${corID} imported without error`);

					//mark project ready
					projectSetting.status = 'ok';
					projectSetting.errorReason = undefined;
					projectSetting.markModified('errorReason');
					
					return projectSetting.save();					

				}).catch(err => {
					// import failed for some reason(s)...
					//mark project failed

					if(projectSetting){
						projectSetting.status = 'failed';
						projectSetting.save();
					}

					err.stack ? req[C.REQ_REPO].logger.logError(err.stack) : req[C.REQ_REPO].logger.logError(err);

		

				});
				

			}
		});

	} else {
		responseCodes.respond(
			responsePlace, 
			req, res, next, 
			responseCodes.QUEUE_NO_CONFIG, 
			{}
		);
	}

}

function listCollaborators(req, res ,next){
	'use strict';

	let project = req.params.project;
	let account = req.params.account;

	ProjectSetting.findById({account, project}, project).then(setting => {

		if(!setting){
			return Promise.reject(responseCodes.PROJECT_NOT_FOUND);
		}

		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, setting.collaborators);
		
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function addCollaborator(req, res ,next){
	'use strict';

	let username = req.body.user;
	let project = req.params.project;
	let account = req.params.account;
	let role = req.body.role;
	let email = req.body.email;

	ProjectHelpers.addCollaborator(username, email, account, project, role).then(resRole => {
		return responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, resRole);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function removeCollaborator(req, res ,next){
	'use strict';

	let project = req.params.project;
	let account = req.params.account;
	let username = req.body.user;
	let role = req.body.role;
	let email = req.body.email;

	ProjectHelpers.removeCollaborator(username, email, account, project, role).then(resRole => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, resRole);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});


}


function getProjectTree(req, res, next){
	'use strict';

	let project = req.params.project;
	let account = req.params.account;
	let username = req.session.user.username;
	let branch;

	if(!req.params.rev){
		branch = C.MASTER_BRANCH_NAME;
	}

	ProjectHelpers.getFullTree(account, project, branch, req.params.rev, username).then(obj => {

		if(!obj.tree){
			return Promise.reject(responseCodes.TREE_NOT_FOUND);
		}

		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, obj.tree);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}


function searchProjectTree(req, res, next){
	'use strict';

	let project = req.params.project;
	let account = req.params.account;
	let username = req.session.user.username;
	let searchString = req.query.searchString;

	let branch;

	if(!req.params.rev){
		branch = C.MASTER_BRANCH_NAME;
	}

	ProjectHelpers.searchTree(account, project, branch, req.params.rev, searchString, username).then(items => {

		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, items);

	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}


function downloadLatest(req, res, next){
	'use strict';
	ProjectHelpers.downloadLatest(req.params.account, req.params.project).then(file => {

		let headers = {
			'Content-Length': file.meta.length,
			'Content-Disposition': 'attachment;filename=' + file.meta.filename,
		};

		if(file.meta.contentType){
			headers['Content-Type'] = file.meta.contentType;
		}

		res.writeHead(200, headers);
		file.readStream.pipe(res);

	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

module.exports = router;


