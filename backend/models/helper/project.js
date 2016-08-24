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
var importQueue = require('../../services/queue');
var C = require('../../constants');
var Mailer = require('../../mailer/mailer');
var systemLogger = require("../../logger.js").systemLogger;
var config = require('../../config');
var History = require('../history');
var utils = require("../../utils");
var stash = require('./stash');
var Ref = require('../ref');

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
        default:
            errObj = responseCodes.FILE_IMPORT_UNKNOWN_ERR;
            break;

    }
    return errObj;
}

function createAndAssignRole(project, account, username, desc, type, federate) {
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
			setting.federate = federate;
			
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
					reject(err);
				} else {
					resolve();
				}
			});

		}));
	});

	return Promise.all(promises);

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

		importToyJSON(account, project).then(() => {
			//mark project ready

			projectSetting.status = 'ok';
			projectSetting.errorReason = undefined;
			projectSetting.markModified('errorReason');
			
			return projectSetting.save();

		}).catch(err => {
			// import failed for some reason(s)...
			console.log('import toy project error', err);
			//mark project failed
			if(projectSetting){
				projectSetting.status = 'failed';
				projectSetting.save();
			}


		});

		//import to queue in background
		// importQueue.importFile(
		// 	__dirname + '/../../statics/3dmodels/toy.ifc', 
		// 	'toy.ifc', 
		// 	account,
		// 	project,
		// 	username,
		// 	copy
		// ).then(corID => Promise.resolve(corID)
		// ).catch(errCode => {
		// 	//catch here to provide custom error message
		// 	console.log(errCode);

		// 	if(projectSetting){
		// 		projectSetting.errorReason = convertToErrorCode(errCode);
		// 		projectSetting.markModified('errorReason');
		// 	}

		// 	return Promise.reject(convertToErrorCode(errCode));

		// }).then(() => {

		// 	//mark project ready

		// 	projectSetting.status = 'ok';
		// 	projectSetting.errorReason = undefined;
		// 	projectSetting.markModified('errorReason');
			
		// 	return projectSetting.save();

		// }).catch(err => {
		// 	// import failed for some reason(s)...
		// 	console.log(err.stack);
		// 	//mark project failed
		// 	if(projectSetting){
		// 		projectSetting.status = 'failed';
		// 		projectSetting.save();
		// 	}


		// });

		//respond once project setting is created
		return Promise.resolve();

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


function createFederatedProject(account, project, subProjects){
	'use strict';
	
	let federatedJSON = {
		database: account,
		project: project,
		subProjects: []
	};
	
	subProjects.forEach(subProject => {
		federatedJSON.subProjects.push({
			database: subProject.database,
			project: subProject.project
		});
	});

	return importQueue.createFederatedProject(account, federatedJSON);
}


function getFullTree(account, project, branch){
	'use strict';

	let revId, treeFileName;
	let subTrees;

	return History.findByBranch({ account, project }, branch).then(history => {

		if(!history){
			return Promise.resolve([]);
		}

		revId = utils.uuidToString(history._id);
		treeFileName = `/${account}/${project}/revision/${revId}/fulltree.json`;

		let filter = {
			type: "ref",
			_id: { $in: history.current }
		};

		return Ref.find({ account, project }, filter);

	}).then(refs => {

		//for all refs get their tree
		let getTrees = [];
		
		refs.forEach(ref => {
			getTrees.push(
				getFullTree(ref.owner, ref.project, uuidToString(ref._rid)).then(tree => {
					return Promise.resolve({
						tree: tree,
						_rid: uuidToString(ref._rid),
						_id: uuidToString(ref._id)
					});
				})
			);
		});

		return Promise.all(getTrees);

	}).then(_subTrees => {

		subTrees = _subTrees;
		return stash.findStashByFilename({ account, project }, 'json_mpc', treeFileName);

	}).then(buf => {

		let tree;

		if(buf){
			tree = JSON.parse(buf);
		}

		subTrees.forEach(subTree => {

			tree && tree.nodes.children && tree.nodes.children.forEach(child => {

				let targetChild = child.children && child.children.find(_child => _child._id === subTree._id);
				if (targetChild){

					subTree && subTree.tree && subTree.tree.nodes && (targetChild.children = [subTree.tree.nodes]);
					(!subTree || !subTree.tree || !subTree.tree.nodes) && (targetChild.status = 'NOT_FOUND');
				} 

			});
		});
		
		return Promise.resolve(tree);

	});
}

function listSubProjects(account, project, branch){
	'use strict';

	let subProjects = [];

	return History.findByBranch({ account, project }, branch).then(history => {



		let filter = {
			type: "ref",
			_id: { $in: history.current }
		};

		return Ref.find({ account, project }, filter);

	}).then(refs => {

		refs.forEach(ref => {
			subProjects.push({
				database: ref.owner,
				project: ref.project
			});
		});

		return Promise.resolve(subProjects);
	
	});
}

module.exports = {
	createAndAssignRole,
	importToyProject,
	convertToErrorCode,
	addCollaborator,
	removeCollaborator,
	createFederatedProject,
	listSubProjects,
	getFullTree
};