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

var Role = require('../role');
var ProjectSetting = require('../projectSetting');
var User = require('../user');
var responseCodes = require('../../response_codes');
//var importQueue = require('../../services/queue');
var C = require('../../constants');
var Mailer = require('../../mailer/mailer');
var systemLogger = require("../../logger.js").systemLogger;
var config = require('../../config');
var stash = require('./stash');


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
        default:
            errObj = responseCodes.FILE_IMPORT_UNKNOWN_ERR;
            break;

    }
    return errObj;
}

function createAndAssignRole(project, account, username, desc, type) {
	'use strict';


	if(!project.match(/^[a-zA-Z0-9_-]{3,20}$/)){
		return Promise.reject({ resCode: responseCodes.INVALID_PROJECT_NAME });
	}

	if(C.REPO_BLACKLIST_PROJECT.indexOf(project) !== -1){
		return Promise.reject({ resCode: responseCodes.BLACKLISTED_PROJECT_NAME });
	}

	return Role.findByRoleID(`${account}.${project}.viewer`).then(role =>{

		if(role){
			return Promise.resolve();
		} else {
			return Role.createViewerRole(account, project);
		}

	}).then(() => {

		return Role.findByRoleID(`${account}.${project}.collaborator`);

	}).then(role => {

		if(role){
			return Promise.resolve();
		} else {
			return Role.createCollaboratorRole(account, project);
		}

	}).then(() => {

		return User.grantRoleToUser(username, account, `${project}.collaborator`);

	}).then(() => {

		return ProjectSetting.findById({account, project}, project).then(setting => {

			if(setting){
				return Promise.reject({resCode: responseCodes.PROJECT_EXIST});
			}

			setting = ProjectSetting.createInstance({
				account: account, 
				project: project
			});
			
			setting._id = project;
			setting.owner = username;
			setting.desc = desc;
			setting.type = type;
			
			return setting.save();
		});

	});
}

function importToyJSON(db, project){
	'use strict';

	let path = '../../statics/toy';

	let importCollectionFiles = {};

	importCollectionFiles[`${project}.history.chunks`] = 'history.chunks.json';
	importCollectionFiles[`${project}.history.files`] = 'history.files.json';
	importCollectionFiles[`${project}.history`] = 'history.json';
	importCollectionFiles[`${project}.issues`] = 'issues.json';
	importCollectionFiles[`${project}.scene`] = 'scene.json';
	importCollectionFiles[`${project}.stash.3drepo.chunks`] = 'stash.3drepo.chunks.json';
	importCollectionFiles[`${project}.stash.3drepo.files`] = 'stash.3drepo.files.json';
	importCollectionFiles[`${project}.stash.3drepo`] = 'stash.3drepo.json';
	importCollectionFiles[`${project}.stash.json_mpc.chunks`] = 'stash.json_mpc.chunks.json';
	importCollectionFiles[`${project}.stash.json_mpc.files`] = 'stash.json_mpc.files.json';
	importCollectionFiles[`${project}.stash.src.chunks`] = 'stash.src.chunks.json';
	importCollectionFiles[`${project}.stash.src.files`] = 'stash.src.files.json';

	let host = config.db.host;
	let username = config.db.username;
	let password = config.db.password;

	let promises = [];

	Object.keys(importCollectionFiles).forEach(collection => {

		let filename = importCollectionFiles[collection];

		promises.push(new Promise((resolve, reject) => {

			require('child_process').exec(
			`mongoimport -j 8 --host ${host} --username ${username} --password ${password} --authenticationDatabase admin --db ${db} --collection ${collection} --file ${path}/${filename}`,
			{ 
				cwd: __dirname
			}, function (err) {
				if(err){
					reject({message: err.message.replace(new RegExp(password, 'g'), '[password masked]').replace(new RegExp(username, 'g'), '[username masked]')});
				} else {
					resolve();
				}
			});

		}));
	});

	return Promise.all(promises).then(() => {
		//rename json_mpc stash
		let jsonBucket = stash.getGridFSBucket({ account: db, project: project }, 'json_mpc');
		
		jsonBucket.find().forEach(file => {
			
			let newFileName = file.filename;
			newFileName = newFileName.split('/');
			newFileName[1] = db;
			newFileName = newFileName.join('/');
			jsonBucket.rename(file._id, newFileName, function(err) {
				err && systemLogger.logError('error while renaming sample project stash', 
					{ err: err, collections: 'stash.json_mpc.files', db: db, _id: file._id, filename: file.filename }
				);
			});
		});

		//rename src stash
		let srcBucket = stash.getGridFSBucket({ account: db, project: project }, 'src');
		
		srcBucket.find().forEach(file => {

			let newFileName = file.filename;
			newFileName = newFileName.split('/');
			newFileName[1] = db;
			newFileName = newFileName.join('/');
			srcBucket.rename(file._id, newFileName, function(err) {
				err && systemLogger.logError('error while renaming sample project stash', 
					{ err: err, collections: 'stash.src.files', db: db, _id: file._id, filename: file.filename }
				);
			});

		});

		return Promise.resolve();

	});

}

function importToyProject(username){
	'use strict';

	let projectSetting;
	let project = 'sample_project';
	let account = username;
	let desc = '';
	let type = 'sample';
	
	//dun move the toy model instead make a copy of it
	// let copy = true;

	
	return createAndAssignRole(project, account, username, desc, type).then(setting => {
		//console.log('setting', setting);
		return Promise.resolve(setting);

	}).then(setting => {

		projectSetting = setting;
		projectSetting.status = 'processing';

		return projectSetting.save();

	}).then(() => {

		return importToyJSON(account, project);

	}).then(() => {
		//mark project ready

		projectSetting.status = 'ok';
		projectSetting.errorReason = undefined;
		projectSetting.markModified('errorReason');
		
		return projectSetting.save();

	}).catch(err => {

		//mark project failed
		if(projectSetting){
			projectSetting.status = 'failed';
			projectSetting.save();
		}

		return Promise.reject(err);

	});
}

function addCollaborator(username, email, account, project, role, disableEmail){
	'use strict';

	let setting;
	let user;
	let action;

	if(role === 'viewer'){
		action = 'view';
	} else if(role === 'collaborator'){
		action = 'collaborate';
	} else {
		return Promise.reject(responseCodes.INVALID_ROLE);
	}


	return ProjectSetting.findById({account, project}, project).then(_setting => {

		setting = _setting;

		if(username){
			return User.findByUserName(username);
		} else {
			return User.findByEmail(email);
		}

	}).then(_user => {
		
		user = _user;

		if(!user){
			return Promise.reject(responseCodes.USER_NOT_FOUND);
		}

		if(!setting){
			return Promise.reject(responseCodes.PROJECT_NOT_FOUND);
		} else if (setting.findCollaborator(user.user, role)) {
			return Promise.reject(responseCodes.ALREADY_IN_ROLE);
		} else if(setting.owner === user.user) {
			return Promise.reject(responseCodes.ALREADY_IN_ROLE);
		}

		return User.findByUserName(account);

	}).then(dbUser => {

		let found = false;
		let subscriptions = dbUser.getActiveSubscriptions();

		subscriptions.forEach(subscription => {
			if(subscription.assignedUser === user.user){
				found = true;
			}
		});

		if(!found){
			return Promise.reject(responseCodes.USER_NOT_ASSIGNED_WITH_LICENSE);
		}

		return User.grantRoleToUser(user.user, account, `${project}.${role}`);

	}).then(() => {

		let roleObj = {
			user: user.user,
			role: role
		};

		setting.collaborators.push(roleObj);

		return setting.save().then(() => {

			if(!disableEmail){
				Mailer.sendProjectInvitation(user.customData.email, {
					action, account, project
				}).catch(err => {
					systemLogger.logError(`Email error - ${err.message}`);
				});
			}

			let res = { role };

			if(email){
				res.email = email;
			}  else if (username){
				res.user = username;
			}

			return Promise.resolve(res);
		});
	});
}

function removeCollaborator(username, email, account, project, role){
	'use strict';

	let setting;
	let user;
	return ProjectSetting.findById({account, project}, project).then(_setting => {

		setting = _setting;

		if(!setting){
			return Promise.reject(responseCodes.PROJECT_NOT_FOUND);
		} else {

			if(username){
				return User.findByUserName(username);
			} else {
				return User.findByEmail(email);
			}
		}


	}).then(_user => {
		
		user = _user;

		if(!user){
			return Promise.reject(responseCodes.USER_NOT_FOUND);
		}

		let deletedCol = setting.removeCollaborator(user.user, role);

		if(!deletedCol){
			return Promise.reject(responseCodes.NOT_IN_ROLE);
		}

		return User.revokeRolesFromUser(user.user, account, `${project}.${role}`);

	}).then(() => {

		return setting.save().then(() => {

			let res = { role };

			if(email){
				res.email = email;
			}  else if (username){
				res.user = username;
			}

			return Promise.resolve(res);
		});
	});
}

module.exports = {
	createAndAssignRole,
	importToyProject,
	convertToErrorCode,
	addCollaborator,
	removeCollaborator
};