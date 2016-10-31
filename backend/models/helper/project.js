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
var Scene = require('../scene');
var Ref = require('../ref');
var utils = require("../../utils");
var stash = require('./stash');
var Ref = require('../ref');
var middlewares = require('../../routes/middlewares');
var C = require("../../constants");


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


function createAndAssignRole(project, account, username, desc, type, unit, subProjects, federate) {
	'use strict';


	if(project.length > 60){
		return Promise.reject({ resCode: responseCodes.PROJECT_NAME_TOO_LONG });
	}

	if(!project.match(projectNameRegExp)){
		return Promise.reject({ resCode: responseCodes.INVALID_PROJECT_NAME });
	}


	if(!unit){
		return Promise.reject({ resCode: responseCodes.PROJECT_NO_UNIT });
	}

	if(C.REPO_BLACKLIST_PROJECT.indexOf(project) !== -1){
		return Promise.reject({ resCode: responseCodes.BLACKLISTED_PROJECT_NAME });
	}


	return ProjectSetting.findById({account, project}, project).then(setting => {

		if(setting){
			return Promise.reject({resCode: responseCodes.PROJECT_EXIST});
		}

		return (federate ? createFederatedProject(account, project, subProjects) : Promise.resolve());

	}).then(() => {

		return Role.findByRoleID(`${account}.${project}.viewer`);

	}).then(role =>{

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

		return ProjectSetting.findById({account, project}, project);

	}).then(setting => {

		setting = setting || ProjectSetting.createInstance({
			account: account,
			project: project
		});

		setting._id = project;
		setting.owner = username;
		setting.desc = desc;
		setting.type = type;
		setting.federate = federate;
		setting.updateProperties({
			unit
		});

		return setting.save();

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

	let host = config.db.host[0];
	let port = config.db.port[0];

	let username = config.db.username;
	let password = config.db.password;

	let promises = [];

	Object.keys(importCollectionFiles).forEach(collection => {

		let filename = importCollectionFiles[collection];

		promises.push(new Promise((resolve, reject) => {

			require('child_process').exec(
			`mongoimport -j 8 --host ${host} --port ${port} --username ${username} --password ${password} --authenticationDatabase admin --db ${db} --collection ${collection} --file ${path}/${filename}`,
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
		let jsonBucket = stash.getGridFSBucket(db, `${project}.stash.json_mpc`);

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
		let srcBucket = stash.getGridFSBucket(db, `${project}.stash.src`);

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

	}).then(() => {
		//change history time and author
		return History.findLatest({account: db, project: project}, { current: 0 });

	}).then(history => {
		
		history.author = db;
		history.timestamp = new Date();

		return history.save();

	}).then(() => {

		let Issue = require('../issue');
		
		let updateIssuePromises = [];

		Issue.find({account: db, project: project}, {}, { owner: 1, comments: 1 }).then(issues => {
			issues.forEach(issue => {
				
				issue.owner = db;
				
				issue.comments.forEach(comment => {
					comment.owner = db;
				});

				updateIssuePromises.push(issue.save());
			});
		});

		return Promise.all(updateIssuePromises);
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

	return createAndAssignRole(project, account, username, desc, type, 'm').then(setting => {
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

		systemLogger.logError(`Import toy project error`, {
			err: err,
			account: username,
			project: project
		});
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
	} else if(role === 'commentator'){
		action = 'comment';
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

		return Role.findByRoleID(`${account}.${project}.${role}`).then(roleFound => {
			if(roleFound){
				return;
			} else if(role === 'viewer') {
				return Role.createViewerRole(account, project);
			} else if(role === 'collaborator') {
				return Role.createCollaboratorRole(account, project);
			} else if(role === 'commentator') {
				return Role.createCommentatorRole(account, project);
			}
		});

	}).then(() => {
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

	let error;

	let addSubProjects = [];

	subProjects.forEach(subProject => {

		if(subProject.database !== account){
			error = responseCodes.FED_MODEL_IN_OTHER_DB;
		}

		addSubProjects.push(ProjectSetting.findById({account, project: subProject.project}, subProject.project).then(setting => {
			if(setting && setting.federate){
				return Promise.reject(responseCodes.FED_MODEL_IS_A_FED);

			} else if(!federatedJSON.subProjects.find(o => o.database === subProject.database && o.project === subProject.project)) {
				federatedJSON.subProjects.push({
					database: subProject.database,
					project: subProject.project
				});
			}
		}));

	});

	if(error){
		return Promise.reject(error);
	}

	if(subProjects.length === 0) {
		return Promise.resolve();
	}

	//console.log(federatedJSON);
	return Promise.all(addSubProjects).then(() => {
		return importQueue.createFederatedProject(account, federatedJSON);
	}).catch(err => {
		//catch here to provide custom error message
		if(err.errCode){
			return Promise.reject(convertToErrorCode(err.errCode));
		}
		return Promise.reject(err);

	});

}

function getModelProperties(account, project, branch, rev, username){
	'use strict';

	let subProperties;
	let revId, modelPropertiesFileName;
	let getHistory, history;
	let status;

	if(rev && utils.isUUID(rev)){
		getHistory = History.findByUID({ account, project }, rev);
	} else if (rev && !utils.isUUID(rev)) {
		getHistory = History.findByTag({ account, project }, rev);
	} else if (branch) {
		getHistory = History.findByBranch({ account, project }, branch);
	}

	return getHistory.then(_history => {
		history = _history;
		return middlewares.hasReadAccessToProjectHelper(username, account, project);
	}).then(granted => {
		if(!history){
			status = 'NOT_FOUND';
			return Promise.resolve([]);
		} else if (!granted) {
			status = 'NO_ACCESS';
			return Promise.resolve([]);
		} else {
			revId = utils.uuidToString(history._id);
			modelPropertiesFileName = `/${account}/${project}/revision/${revId}/modelProperties.json`;

			let filter = {
				type: "ref",
				_id: { $in: history.current }
			};
			return Ref.find({ account, project }, filter);
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
						project: ref.project
					});
				})
			);
		});

		return Promise.all(getModelProps);

	}).then(_subProperties => {

		subProperties = _subProperties;
		return stash.findStashByFilename({ account, project }, 'json_mpc', modelPropertiesFileName);

	}).then(buf => {
		let properties;

		if(buf){
			properties = JSON.parse(buf);
		} else if (!status && !buf){
			properties = {};
		}

		if (!properties.hiddenNodes)
		{
			properties.hiddenNodes = [];
		}

		subProperties.forEach(subProperty => {
			// Model properties hidden nodes
			// For a federation concatenate all together in a
			// single array

			if (subProperty.properties.hiddenNodes)
			{
				properties.hiddenNodes = properties.hiddenNodes.concat(subProperty.properties.hiddenNodes);
			}
		});

		return Promise.resolve({properties, status});

	});
}

function getFullTree(account, project, branch, rev, username){
	'use strict';

	let revId, treeFileName;
	let subTrees;
	let status;
	let history;
	let getHistory;

	if(rev && utils.isUUID(rev)){

		getHistory = History.findByUID({ account, project }, rev);

	} else if (rev && !utils.isUUID(rev)) {

		getHistory = History.findByTag({ account, project }, rev);

	} else if (branch) {

		getHistory = History.findByBranch({ account, project }, branch);
	}

	return getHistory.then(_history => {

		history = _history;
		return middlewares.hasReadAccessToProjectHelper(username, account, project);

	}).then(granted => {

		if(!history){

			status = 'NOT_FOUND';
			return Promise.resolve([]);

		} else if (!granted) {

			status = 'NO_ACCESS';
			return Promise.resolve([]);

		} else {

			revId = utils.uuidToString(history._id);
			treeFileName = `/${account}/${project}/revision/${revId}/fulltree.json`;

			let filter = {
				type: "ref",
				_id: { $in: history.current }
			};

			return Ref.find({ account, project }, filter);

		}

	}).then(refs => {

		//for all refs get their tree
		let getTrees = [];

		refs.forEach(ref => {

			let refBranch, refRev;

			if (utils.uuidToString(ref._rid) === C.MASTER_BRANCH){
				refBranch = C.MASTER_BRANCH_NAME;
			} else {
				refRev = utils.uuidToString(ref._rid);
			}

			getTrees.push(
				getFullTree(ref.owner, ref.project, refBranch, refRev, username).then(obj => {
					return Promise.resolve({
						tree: obj.tree,
						status: obj.status,
						_rid: utils.uuidToString(ref._rid),
						_id: utils.uuidToString(ref._id)
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
		} else if (!status && !buf){
			status = 'NOT_FOUND';
		}

		let resetPath = function(node, parentPath){
			node.children && node.children.forEach(child => {
				child.path = parentPath + '__' + child.path; 
				resetPath(child, child.path);
			});
		};

		let setIdToPath = function(obj, idToPath){
			idToPath[obj._id] = obj.path;
			obj.children && obj.children.forEach(child => setIdToPath(child, idToPath));
		};

		subTrees.forEach(subTree => {

			tree && tree.nodes.children && tree.nodes.children.forEach(child => {

				let targetChild = child.children && child.children.find(_child => _child._id === subTree._id);
				if (targetChild){

					if(subTree && subTree.tree && subTree.tree.nodes){
						subTree.tree.nodes.path = targetChild.path + '__' + subTree.tree.nodes.path;
						resetPath(subTree.tree.nodes, subTree.tree.nodes.path);
						targetChild.children = [subTree.tree.nodes];

						let idToPath = {};

						setIdToPath(subTree.tree.nodes, idToPath);
						Object.assign(tree.idToPath, idToPath);
					}

					(!subTree || !subTree.tree || !subTree.tree.nodes) && (targetChild.status = subTree.status);
				}

			});
		});

		return Promise.resolve({tree, status});

	});
}

function searchTree(account, project, branch, rev, searchString, username){
	'use strict';

	let getHistory;

	if(rev && utils.isUUID(rev)){
		getHistory = History.findByUID({account, project}, rev);
	} else if (rev && !utils.isUUID(rev)){
		getHistory = History.findByTag({account, project}, rev);
	} else {
		getHistory = History.findByBranch({account, project}, branch);
	}

	let items = [];
	let history;

	let search = () => getHistory.then(_history => {

		history = _history;

		if(!history){
			return Promise.reject(responseCodes.PROJECT_HISTORY_NOT_FOUND);
		}

		let filter = {
			_id: {'$in': history.current },
			name: new RegExp(searchString, 'i')
		};

		return Scene.find({account, project}, filter, { name: 1 });

	}).then(objs => {

		objs.forEach((obj, i) => {

			objs[i] = obj.toJSON();
			objs[i].account = account;
			objs[i].project = project;
			items.push(objs[i]);

		});

		let filter = {
			_id: {'$in': history.current },
			type: 'ref'
		};

		return Ref.find({account, project}, filter);

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

	return middlewares.hasReadAccessToProjectHelper(username, account, project).then(granted => {
		if(granted){
			return search();
		} else {
			return Promise.resolve([]);
		}
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


function downloadLatest(account, project){
	'use strict';

	let bucket =  stash.getGridFSBucket(account, `${project}.history`);

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

var fileNameRegExp = /[ *"\/\\[\]:;|=,<>$]/g;
var projectNameRegExp = /^[a-zA-Z0-9_]{1,60}$/;
var acceptedFormat = [
	'x','obj','3ds','md3','md2','ply',
	'mdl','ase','hmp','smd','mdc','md5',
	'stl','lxo','nff','raw','off','ac',
	'bvh','irrmesh','irr','q3d','q3s','b3d',
	'dae','ter','csm','3d','lws','xml','ogex',
	'ms3d','cob','scn','blend','pk3','ndo',
	'ifc','xgl','zgl','fbx','assbin'
];

module.exports = {
	createAndAssignRole,
	importToyProject,
	convertToErrorCode,
	addCollaborator,
	removeCollaborator,
	createFederatedProject,
	listSubProjects,
	getFullTree,
	getModelProperties,
	searchTree,
	downloadLatest,
	fileNameRegExp,
	projectNameRegExp,
	acceptedFormat
};
