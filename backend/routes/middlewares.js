/**
 *	Copyright (C) 2014 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var _ = require('lodash');
var responseCodes = require('../response_codes');
var C				= require("../constants");
var ProjectSetting = require('../models/projectSetting');
// var History = require('../models/history');
var User = require('../models/user');
var RoleTemplates = require('../models/role_templates');
var utils = require("../utils");
var config = require('../config');
var Project = require('../models/project');

// init ampq and import queue object
var importQueue = require('../services/queue');

function hasReadAccessToProjectHelper(username, account, project){
	return checkSystemPermissions(
		username, 
		account, 
		project, 
		[C.PERM_VIEW_PROJECT]
	);
}

function hasReadAccessToIssue(req, res, next){
	'use strict';
	hasAccessTo(req, res, next, [C.PERM_VIEW_ISSUE]);
}

function hasWriteAccessToIssue(req, res, next){
	'use strict';
	hasAccessTo(req, res, next, [C.PERM_CREATE_ISSUE]);
}

function hasWriteAccessToProject(req, res, next){
	'use strict';
	hasAccessTo(req, res, next, [C.PERM_UPLOAD_FILES]);
}

function hasReadAccessToProject(req, res, next){
	'use strict';
	hasAccessTo(req, res, next, [C.PERM_VIEW_PROJECT]);
}

function hasAccessTo(req, res, next, requestedPerms){
	'use strict';

	checkSystemPermissions(
		req.session.user.username, 
		req.params.account, 
		req.params.project, 
		requestedPerms
	).then(granted => {
		if(granted){
			next();
		} else {
			return Promise.reject(responseCodes.NOT_AUTHORIZED);
		}
	}).catch(err => {

		responseCodes.respond(utils.APIInfo(req), req, res, next, err.resCode ? err.resCode: err, err.resCode ? err.resCode: err);
	});
}


function loggedIn(req, res, next){
	'use strict';

	if (!req.session || !req.session.hasOwnProperty(C.REPO_SESSION_USER)) {
		responseCodes.respond("Check logged in middleware", req, res, next, responseCodes.AUTH_ERROR, null, req.params);
	} else {
		next();
	}
}


function checkRole(acceptedRoles, req){
	'use strict';

	let username = req.session.user.username;
	return User.findByUserName(username).then(user => {
		let roles = user.roles;

		roles = _.filter(roles, item => {
			return acceptedRoles.indexOf(item.role) !== -1 && item.db === req.params.account;
		});

		if(roles.length > 0){
			return Promise.resolve(_.map(roles, 'role'));
		} else {
			return Promise.reject(responseCodes.AUTH_ERROR);
		}
	});

}

function freeSpace(account){
	'use strict';

	let limits;

	//console.log('checking free space');
	return User.findByUserName(account).then( dbUser => {

		limits = dbUser.customData.billing.subscriptions.getSubscriptionLimits();
		return User.historyChunksStats(account);

	}).then(stats => {

		let totalSize = 0;

		stats.forEach(stat => {
			totalSize += stat.size;
		});

		// console.log(limits.spaceLimit);
		// console.log(totalSize);

		return Promise.resolve(limits.spaceLimit - totalSize);
	});

}

function hasCollaboratorQuota(req, res, next){
	'use strict';

	let limits;

	let account = req.params.account;
	let project = req.params.project;

	return User.findByUserName(account).then( dbUser => {

		limits = dbUser.customData.billing.subscriptions.getSubscriptionLimits();

		return ProjectSetting.findById({account}, project);

	}).then(projectSetting => {

		if(limits.collaboratorLimit - projectSetting.collaborators.length > 0){
			next();
		} else {
			responseCodes.respond("", req, res, next, responseCodes.COLLABORATOR_LIMIT_EXCEEDED , null, {});
		}

	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err.resCode ? err.resCode: err, err.resCode ? err.resCode: err);
	});
}

function createQueueInstance(){
	'use strict';

	// init ampq and import queue object
	let log_iface = require("../logger.js");
	let systemLogger = log_iface.systemLogger;

	return importQueue.connect(config.cn_queue.host, {

		shared_storage: config.cn_queue.shared_storage,
		logger: systemLogger,
		callback_queue: config.cn_queue.callback_queue,
		worker_queue: config.cn_queue.worker_queue,
		event_exchange: config.cn_queue.event_exchange

	}).then(() => importQueue);
	

}

function connectQueue(req, res, next){
	'use strict';

	// init ampq and import queue object
	if(config.cn_queue){

		createQueueInstance().then(() => {
			next();
		}).catch(err => {
			responseCodes.respond("Express Middleware - AMPQ", req, res, next, err);
		});

	} else {
		next();
	}

}

function isAccountAdminHelper(username, account){
	return checkSystemPermissions(
		username, 
		account, 
		'', 
		RoleTemplates.roleTemplates[C.ADMIN_TEMPLATE]
	);
}

function isAccountAdmin(req, res, next){
	'use strict';

	let username = req.session.user.username;
	let account = req.params.account;

	checkSystemPermissions(
		username, 
		account, 
		'', 
		RoleTemplates.roleTemplates[C.ADMIN_TEMPLATE]
	).then(granted => {
		if(granted){
			next();
		} else {
			return Promise.reject(responseCodes.NOT_AUTHORIZED);
		}
	}).catch(err => {

		responseCodes.respond(utils.APIInfo(req), req, res, next, err.resCode ? err.resCode: err, err.resCode ? err.resCode: err);
	});

}

function checkSystemPermissions(username, db, project, requestPerms){
	'use strict';
	
	return User.findByUserName(username).then(user => {
		return user.getPrivileges();
	}).then(role => {
		//console.log(JSON.stringify(roles, null, 2))
		return RoleTemplates.determinePermission(db, project, role);
	}).then(perms => {
		//console.log(perms);
		if(_.intersection(requestPerms, perms).length === requestPerms.length){
			return true;
		} else {
			return false;
		}
	});
}


function hasWriteAccessToProjectSettings(req, res, next){
	'use strict';
	hasAccessTo(req, res, next, [C.PERM_CHANGE_PROJECT_SETTINGS]);
}

function hasDeleteAccessToProject(req, res, next){
	'use strict';
	hasAccessTo(req, res, next, [C.PERM_DELETE_PROJECT]);
}

function hasDownloadAccessToProject(req, res, next){
	'use strict';
	hasAccessTo(req, res, next, [C.PERM_DOWNLOAD_PROJECT]);
}

function hasReadAccessToIssue(req, res, next){
	'use strict';
	hasAccessTo(req, res, next, [C.PERM_VIEW_ISSUE]);
}


// get permissions adapter
function getPermissionsAdapter(account) {
	'use strict';

	return {
		getUser: function(){
			if(this.dbUser){
				return Promise.resolve(this.dbUser);
			} else {
				return User.findByUserName(account).then(user => {
					this.dbUser = user;
					return this.dbUser;
				});
			}
		},

		accountLevel: function(username){
			return this.getUser().then(user => {
				const sub = user.customData.billing.subscriptions.findByAssignedUser(username);
				return sub && sub.permissions;
			});
		},

		projectLevel: function(username, projectGroup){
			return Project.findOne({account}, { name: projectGroup}).then(project => {
				return project.findPermsByUser(username).permissions;
			});
		},

		modelLevel: function(username, project){
			let user;
			this.getUser().then(_user => {
				user = _user;
				return ProjectSetting.findById({account, project}, project);

			}).then(setting => {
				return user.customData.permissionTemplates.findById(setting.findPermissionByUser(username).permission).permissions;
			});
		}
	};
}

const checkPermissionsHelper = require('../middlewares/checkPermissions');

function checkPermissions(permsRequest){

	return function(req, res, next){
		
		const username = req.session.user.username;
		const account = req.params.account;
		const project = req.params.project;
		const projectGroup = req.params.projectGroup;

		checkPermissionsHelper(username, account, projectGroup, project, permsRequest, getPermissionsAdapter).then(granted => {

			if(granted){
				next();
			} else {
				return Promise.reject(responseCodes.NOT_AUTHORIZED);
			}

		}).catch(err => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, err.resCode ? err.resCode: err, err.resCode ? err.resCode: err);
		});
	};

}

var middlewares = {

	// Real middlewares taking req, res, next
	hasReadAccessToProject: [loggedIn, hasReadAccessToProject],
	hasWriteAccessToProject: [loggedIn, hasWriteAccessToProject],
	hasWriteAccessToIssue: [loggedIn, hasWriteAccessToIssue],
	hasWriteAccessToProjectSettings: [loggedIn, hasWriteAccessToProjectSettings],
	hasDeleteAccessToProject: [loggedIn, hasDeleteAccessToProject],
	hasDownloadAccessToProject: [loggedIn, hasDownloadAccessToProject],
	hasReadAccessToIssue: [loggedIn, hasReadAccessToIssue],
	isAccountAdmin: [loggedIn, isAccountAdmin],
	hasCollaboratorQuota: [loggedIn, hasCollaboratorQuota],
	connectQueue,
	checkPermissions,
	// Helpers
	freeSpace,
	loggedIn,
	checkRole,
	hasReadAccessToProjectHelper,
	isAccountAdminHelper,
	createQueueInstance,
	checkPermissionsHelper,

};

module.exports = middlewares;
