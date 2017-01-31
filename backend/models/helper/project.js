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
var RoleSetting = require('../roleSetting');
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
var _ = require('lodash');
var multer = require("multer");
var fs = require('fs');
var ChatEvent = require('../chatEvent');

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


function createAndAssignRole(project, account, username, data) {
	'use strict';

	if(!project.match(projectNameRegExp)){
		return Promise.reject({ resCode: responseCodes.INVALID_PROJECT_NAME });
	}

	if(data.code && !ProjectSetting.projectCodeRegExp.test(data.code)){
		return Promise.reject({ resCode: responseCodes.INVALID_PROJECT_CODE });
	}

	if(!data.unit){
		return Promise.reject({ resCode: responseCodes.PROJECT_NO_UNIT });
	}

	if(C.REPO_BLACKLIST_PROJECT.indexOf(project) !== -1){
		return Promise.reject({ resCode: responseCodes.BLACKLISTED_PROJECT_NAME });
	}


	return ProjectSetting.findById({account, project}, project).then(setting => {

		if(setting){
			return Promise.reject({resCode: responseCodes.PROJECT_EXIST});
		}

		return (data.federate ? createFederatedProject(account, project, data.subProjects) : Promise.resolve());

	}).then(() => {

		return Role.createStandardRoles(account, project);
	
	}).then(() => {

		return Role.grantProjectRoleToUser(username, account, project, C.COLLABORATOR_TEMPLATE);

	}).then(() => {

		return ProjectSetting.findById({account, project}, project);

	}).then(setting => {

		setting = setting || ProjectSetting.createInstance({
			account: account,
			project: project
		});

		setting._id = project;
		setting.owner = username;
		setting.desc = data.desc;
		setting.type = data.type;
		setting.federate = data.federate;

		setting.updateProperties({
			unit: data.unit,
			code: data.code,
		});

		setting.properties.topicTypes = ProjectSetting.defaultTopicTypes;
		
		return setting.save();

	}).then(setting => {

		// this is true if only admin can create project
		return {

			setting,
			project: {
				account,
				project,
				permissions: RoleTemplates.roleTemplates[C.ADMIN_TEMPLATE]
			}

		};
	});
}

function importToyProject(username){
	'use strict';

	let project = 'sample_project';
	let account = username;
	let desc = '';
	let type = 'sample';

	//dun move the toy model instead make a copy of it
	// let copy = true;

	let data = {
		desc, type, unit: 'm'
	};
	
	return createAndAssignRole(project, account, username, data).then(data => {
		return Promise.resolve(data.setting);
	}).then(setting => {
		importProject(account, project, username, setting, {type: 'bson', dir: '../../statics/toy'});
	});
}

function addCollaborator(username, email, account, project, role, disableEmail){
	'use strict';

	let setting;
	let user;

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
		let subscriptions = dbUser.customData.billing.subscriptions.getActiveSubscriptions();

		subscriptions.forEach(subscription => {
			if(subscription.assignedUser === user.user){
				found = true;
			}
		});

		if(!found){
			return Promise.reject(responseCodes.USER_NOT_ASSIGNED_WITH_LICENSE);
		}

	}).then(() => {

		return Role.grantProjectRoleToUser(user.user, account, project, role);

	}).then(() => {

		let roleObj = {
			user: user.user,
			role: role
		};

		setting.collaborators.push(roleObj);

		return setting.save().then(() => {

			if(!disableEmail){
				Mailer.sendProjectInvitation(user.customData.email, {
					account, project
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

		return Role.revokeRolesFromUser(user.user, [{
			db: account, 
			role: `${project}.${role}`
		}]);

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

	let files = function(data){
		return [
			{desc: 'json file', type: 'file', path: data.jsonFilename}, 
			{desc: 'tmp dir', type: 'dir', path: data.newFileDir}
		];
	};

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
	}).then(data => {


		_deleteFiles(files(data));

		return;

	}).catch(err => {
		//catch here to provide custom error message
		_deleteFiles(files(err));

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
		let properties = { hiddenNodes : null };

		if(buf){
			properties = JSON.parse(buf);
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

// more efficient, no json parsing, no idToPath generation for fed project, but only support 1 level of fed
function newGetFullTree(account, project, branch, rev, username){
	'use strict';

	let getHistory;
	let history;

	let trees = {};

	if(rev && utils.isUUID(rev)){

		getHistory = History.findByUID({ account, project }, rev);

	} else if (rev && !utils.isUUID(rev)) {

		getHistory = History.findByTag({ account, project }, rev);

	} else if (branch) {

		getHistory = History.findByBranch({ account, project }, branch);
	}

	return getHistory.then(_history => {

		history = _history;

		if(!history){
			return Promise.reject(responseCodes.TREE_NOT_FOUND);
		}

		let revId = utils.uuidToString(history._id);
		let treeFileName = `/${account}/${project}/revision/${revId}/fulltree.json`;

		return stash.findStashByFilename({ account, project }, 'json_mpc', treeFileName);

	}).then(buf => {

		trees.mainTree = buf.toString();

		let filter = {
			type: "ref",
			_id: { $in: history.current }
		};

		return Ref.find({ account, project }, filter);

	}).then(refs => {

		//for all refs get their tree
		let getTrees = [];

		refs.forEach(ref => {

			let getRefId;

			if (utils.uuidToString(ref._rid) === C.MASTER_BRANCH){
				
				getRefId = History.findByBranch({ account: ref.owner, project: ref.project }, C.MASTER_BRANCH_NAME).then(_history => {
					return _history ? utils.uuidToString(_history._id) : null;
				});

			} else {
				getRefId = Promise.resolve(utils.uuidToString(ref._rid));
			}

			let status;
			let getTree = middlewares.hasReadAccessToProjectHelper(username, ref.owner, ref.project).then(granted => {
				
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
					return stash.findStashByFilename({ account: ref.owner, project: ref.project }, 'json_mpc', treeFileName);
				});

			}).then(buf => { 
				return {
					status, 
					buf: buf && buf.toString(), 
					_id: utils.uuidToString(ref._id)
				};
			});

			getTrees.push(getTree);

		});

		return Promise.all(getTrees);

	}).then(subTrees => {
		trees.subTrees = subTrees;
		return trees;
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

	let items = [];

	let search = (history) => {

		let filter = {
			_id: {'$in': history.current },
			name: new RegExp(searchString, 'i')
		};

		return Scene.find({account, project}, filter, { name: 1 }).then(objs => {

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
	};

	return middlewares.hasReadAccessToProjectHelper(username, account, project).then(granted => {

		if(granted){

			let getHistory;

			if(rev && utils.isUUID(rev)){
				getHistory = History.findByUID({account, project}, rev);
			} else if (rev && !utils.isUUID(rev)){
				getHistory = History.findByTag({account, project}, rev);
			} else {
				getHistory = History.findByBranch({account, project}, branch);
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

function listSubProjects(account, project, branch){
	'use strict';

	let subProjects = [];

	return History.findByBranch({ account, project }, branch).then(history => {


		if(history){
			let filter = {
				type: "ref",
				_id: { $in: history.current }
			};

			return Ref.find({ account, project }, filter);
		} else {
			return [];
		}


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

function getRolesForProject(account, project, removeViewer){
	'use strict';

	let roleSettings;


	return RoleSetting.find({ account }).then(_roleSetting => {

		roleSettings = _.indexBy(_roleSetting, '_id');

		return Role.find({ account: 'admin'}, {
			'$or': [{
				'privileges' : {
					'$elemMatch': {
						'resource.db': account, 
						'resource.collection': `${project}.history`,
						'actions': 'find'
					}
				}
			},{ 
				'roles': {
					'$elemMatch': {
						"db" : account
					}
				}
			}]

		},{
			role: 1, db: 1, _id: 0
		});

	}).then(roles => {

		roles.forEach((role, i)  => roles[i] = role.toObject());
		return Role.viewRolesWithInheritedPrivs(roles);

	}).then(roles => {

		//console.log(JSON.stringify(roles, null , 2));

		//filter again because old role inherits viewer role and the first db query will get list of all roles inherited from other roles regardless of project name(collection name)
		roles = roles.filter(role => {

			return role.inheritedPrivileges.find(priv => {
				return  priv.resource.db === account &&
						(priv.resource.collection === `${project}.history` || priv.resource.collection === '' ) &&
						priv.actions.indexOf('find') !== -1;
			});
		});

		roles.forEach((role, i) => {
			
			roles[i].permissions = RoleTemplates.determinePermission(account, project, role);

			if(roleSettings[roles[i].role]){
				roles[i].color = roleSettings[roles[i].role].color;
				roles[i].desc = roleSettings[roles[i].role].desc;
			}

			roles[i] = _.pick(roles[i], ['role', 'db', 'color', 'desc', 'permissions']);
		});

		for(let i = roles.length - 1; i >= 0; i--){
			if (removeViewer && 
				roles[i].permissions.indexOf(C.PERM_COMMENT_ISSUE) === -1)
			{
				roles.splice(i, 1);
			}
		}

		return roles;
	});
}

function getUserRolesForProject(account, project, username){
	'use strict';

	let projectRoles;

	return getRolesForProject(account, project).then(roles => {
		
		projectRoles = roles;
		return User.findByUserName(username);

	}).then(user => {

		let userRolesForProject = user.roles.filter(userRole => {

			return projectRoles.find(projectRole => {
				return projectRole.db === userRole.db && projectRole.role === userRole.role;
			});

		});

		let roles = userRolesForProject.map(item => item.role);
		// rank C.ADMIN_TEMPLATE role first
		let adminRoleIndex = roles.indexOf(C.ADMIN_TEMPLATE);
		if(adminRoleIndex !== -1){
			roles.splice(adminRoleIndex, 1);
			roles.unshift(C.ADMIN_TEMPLATE);
		}

		return roles;
	});
}



function uploadFile(req){
	'use strict';

	if (!config.cn_queue) {
		return Promise.reject(responseCodes.QUEUE_NO_CONFIG);
	}

	let account = req.params.account;
	let project = req.params.project;
	//upload project with tag
	let checkTag = tag => {
		if(!tag){
			return Promise.resolve();
		} else {
			return (tag.match(History.tagRegExp) ? Promise.resolve() : Promise.reject(responseCodes.INVALID_TAG_NAME)).then(() => {
				return History.findByTag({account, project}, tag, {_id: 1});
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

function _handleUpload(account, project, username, file, data){
	'use strict';


	let files = function(filePath, fileDir, jsonFile){
		return [
			{desc: 'tmp model file', type: 'file', path: filePath}, 
			{desc: 'json file', type: 'file', path: jsonFile}, 
			{desc: 'tmp dir', type: 'dir', path: fileDir}
		];
	}

	return importQueue.importFile(
		file.path,
		file.originalname,
		account,
		project,
		username,
		null,
		data.tag,
		data.desc
	).then(obj => {

		let corID = obj.corID;

		systemLogger.logInfo(`Job ${corID} imported without error`,{
			account,
			project,
			username
		});

		_deleteFiles(files(obj.newPath, obj.newFileDir, obj.jsonFilename));
		return Promise.resolve(obj);

	}).catch(err => {

		_deleteFiles(files(err.newPath, err.newFileDir, err.jsonFilename));
		return err.errCode ? Promise.reject(convertToErrorCode(err.errCode)) : Promise.reject(err);
	});

}

function _importBSON(account, project, username, dir){
	'use strict';

	let importCollectionFiles = {};
	
	fs.readdirSync(`${__dirname}/${dir}`).forEach(file => {
		// remove '.json' in string
		let collectionName = file.split('.');
		collectionName.pop();
		collectionName = collectionName.join('.');

		importCollectionFiles[`${project}.${collectionName}`] = file;
	});


	let host = config.db.host[0];
	let port = config.db.port[0];

	let dbUsername = config.db.username;
	let dbPassword = config.db.password;

	let promises = [];

	Object.keys(importCollectionFiles).forEach(collection => {

		let filename = importCollectionFiles[collection];

		promises.push(new Promise((resolve, reject) => {

			require('child_process').exec(
			`mongoimport -j 8 --host ${host} --port ${port} --username ${dbUsername} --password ${dbPassword} --authenticationDatabase admin --db ${account} --collection ${collection} --file ${dir}/${filename}`,
			{
				cwd: __dirname
			}, function (err) {
				if(err){
					reject({message: err.message.replace(new RegExp(dbPassword, 'g'), '[password masked]').replace(new RegExp(dbUsername, 'g'), '[username masked]')});
				} else {
					resolve();
				}
			});

		}));
	});

	return Promise.all(promises).then(() => {
		//rename json_mpc stash
		systemLogger.logInfo(`toy project BSON imported without error`,{
			account,
			project,
			username
		});

		let jsonBucket = stash.getGridFSBucket(account, `${project}.stash.json_mpc`);

		jsonBucket.find().forEach(file => {

			let newFileName = file.filename;
			newFileName = newFileName.split('/');
			newFileName[1] = account;
			newFileName = newFileName.join('/');
			jsonBucket.rename(file._id, newFileName, function(err) {
				err && systemLogger.logError('error while renaming sample project stash',
					{ err: err, collections: 'stash.json_mpc.files', db: account, _id: file._id, filename: file.filename }
				);
			});
		});

		//rename src stash
		let srcBucket = stash.getGridFSBucket(account, `${project}.stash.src`);

		srcBucket.find().forEach(file => {

			let newFileName = file.filename;
			newFileName = newFileName.split('/');
			newFileName[1] = account;
			newFileName = newFileName.join('/');
			srcBucket.rename(file._id, newFileName, function(err) {
				err && systemLogger.logError('error while renaming sample project stash',
					{ err: err, collections: 'stash.src.files', db: account, _id: file._id, filename: file.filename }
				);
			});

		});

		return Promise.resolve();

	}).then(() => {
		//change history time and author
		return History.findLatest({account: account, project: project}, { current: 0 });

	}).then(history => {

		history.author = username;
		history.timestamp = new Date();

		return history.save();

	}).then(() => {

		let Issue = require('../issue');

		let updateIssuePromises = [];

		Issue.find({account: account, project: project}, {}, { owner: 1, comments: 1 }).then(issues => {
			issues.forEach(issue => {

				issue.owner = account;

				issue.comments.forEach(comment => {
					comment.owner = username;
				});

				updateIssuePromises.push(issue.save());
			});
		});

		return Promise.all(updateIssuePromises);
	});

}

function importProject(account, project, username, projectSetting, source, data){
	'use strict';

	if(!projectSetting){
		return Promise.reject({ message: `projectSetting is ${projectSetting}`});
	}

	projectSetting.status = 'processing';

	return projectSetting.save().then(() => {

		if(source.type === 'bson'){
			return _importBSON(account, project, username, source.dir);
		} else if (source.type === 'upload'){
			return _handleUpload(account, project, username, source.file, data);
		}

	}).then(() => {

		projectSetting.status = 'ok';
		projectSetting.errorReason = undefined;
		projectSetting.markModified('errorReason');

		ChatEvent.projectStatusChanged(null, account, project, projectSetting);

		return projectSetting.save();

	}).catch(err => {

		// import failed for some reason(s)...
		//mark project failed

		systemLogger.logError(`Error while importing project from source ${source.type}`, {
			stack : err.stack,
			err: err,
			account,
			project,
			username
		});

		projectSetting.status = 'failed';
		projectSetting.errorReason = err;
		projectSetting.markModified('errorReason');
		projectSetting.save();

		ChatEvent.projectStatusChanged(null, account, project, projectSetting);


		return Promise.reject(err);

	});
}

function removeProject(account, project){
	'use strict';

	let setting;
	return ProjectSetting.findById({account, project}, project).then(_setting => {

		setting = _setting;

		if(!setting){
			return Promise.reject({resCode: responseCodes.PROJECT_NOT_FOUND});
		}

	}).then(() => {
		return ModelFactory.db.db(account).listCollections().toArray();

	}).then(collections => {
		//remove project collections

		let promises = [];
		
		collections.forEach(collection => {
			if(collection.name.startsWith(project)){
				promises.push(ModelFactory.db.db(account).dropCollection(collection.name));
			}
		});

		return Promise.all(promises);

	}).then(() => {
		//remove project settings
		return setting.remove();

	}).then(() => {
		//remove roles related to this project from system.roles collection
		let promises = [];
		
		RoleTemplates.projectRoleTemplateLists.forEach(role => {
			promises.push(Role.dropRole(account, `${project}.${role}`));
		});

		return Promise.all(promises);
	});

}

function getProjectPermission(username, account, project){
	'use strict';

	let permissions = [];

	return User.findByUserName(username).then(user => {

		return Role.viewRolesWithInheritedPrivs(user.roles);
	}).then(roles => {

		roles.forEach(role => {
			permissions = permissions.concat(RoleTemplates.determinePermission(account, project, role));
		});

		return _.unique(permissions);
	});
}

function getMetadata(account, project, id){
	'use strict';
	
	let projection = {
		shared_id: 0,
		paths: 0,
		type: 0,
		api: 0,
		parents: 0
	};

	return Scene.findOne({account, project}, { _id: utils.stringToUUID(id) }, projection).then(obj => {
		if(obj){
			return obj;
		} else {
			return Promise.reject(responseCodes.METADATA_NOT_FOUND);
		}
	});

}

var fileNameRegExp = /[ *"\/\\[\]:;|=,<>$]/g;
var projectNameRegExp = /^[a-zA-Z0-9_\-]{3,20}$/;
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
	acceptedFormat,
	getUserRolesForProject,
	getRolesForProject,
	uploadFile,
	importProject,
	removeProject,
	getProjectPermission,
	newGetFullTree,
	getMetadata
};
