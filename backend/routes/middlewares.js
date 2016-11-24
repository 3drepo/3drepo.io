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
var Role = require('../models/role');

var config = require('../config');

var READ_BIT	= 4;
var WRITE_BIT	= 2;
// var EXECUTE_BIT	= 1;

// init ampq and import queue object
var importQueue = require('../services/queue');

function getAccessByCollection(username, account, collection){
	'use strict';

	return User.findByUserName(username).then(user => {
		return user.getPrivileges();

	}).then(privileges => {

		//Determine the access rights of a project via privileges on the history collection
		let writePermission = false;
		let readPermission = false;

		//console.log(privileges);
		for (let i = 0; i < privileges.length; i++) {
			if (privileges[i].resource.db === account) {
				//console.log(privileges[i]);
				if (privileges[i].resource.collection === "" || privileges[i].resource.collection === collection) {
					readPermission |= privileges[i].actions.indexOf("find") > -1;
					writePermission |= privileges[i].actions.indexOf("insert") > -1;

				}
			}
		}

		let permissionFlag = readPermission? READ_BIT : 0;
		permissionFlag += writePermission? WRITE_BIT : 0;

		return Promise.resolve(permissionFlag);
	});
}

function hasReadAccessToProjectHelper(username, account, project){
	return hasAccessToProjectHelper(username, account, project, READ_BIT);
}

function hasAccessToProjectHelper(username, account, project, permissionBit){
	return getAccessByCollection(username, account, project + ".history").then(permissionFlag => {
		return Promise.resolve(permissionFlag & permissionBit);
	});
}

function hasAccessToCollection(req, res, next, collection, permissionBit){
	'use strict';

	let username = req.session.user.username;
	let account = req.params.account;
	//let project = req.params.project;

	return getAccessByCollection(username, account, collection).then(permissionFlag => {
		return Promise.resolve(permissionFlag & permissionBit);
	}).then(granted => {
		if(granted){
			next();
		} else {
			return Promise.reject(responseCodes.NOT_AUTHORIZED);
		}
	}).catch(err => {
		responseCodes.respond("Middleware: check has access to " + collection, req, res, next, err , null, err);
	});
}

function hasWriteAccessToIssue(req, res, next){
	'use strict';

	let collection = req.params.project + '.issues';
	return hasAccessToCollection(req, res, next, collection, WRITE_BIT);
}

function hasWriteAccessToProject(req, res, next){
	'use strict';

	let collection = req.params.project + '.history';
	return hasAccessToCollection(req, res, next, collection, WRITE_BIT);
}

function hasReadAccessToProject(req, res, next){
	'use strict';

	let collection = req.params.project + '.history';
	return hasAccessToCollection(req, res, next, collection, READ_BIT);
}

function hasAccessToAccount(req, res, next){
	'use strict';

	let username = req.session.user.username;
	if(username === req.params.account){
		next();
	} else {
		responseCodes.respond("Middleware: check has access to account", req, res, next, responseCodes.NOT_AUTHORIZED , null, {});
	}
}

function hasReadAccessToAccount(req, res, next){
	hasAccessToAccount(req, res, next);
}

function hasWriteAccessToAccount(req, res, next){
	hasAccessToAccount(req, res, next);
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


function canCreateDatabase(req, res, next){
	'use strict';

	if (req.session[C.REPO_SESSION_USER] && req.params.account === req.session[C.REPO_SESSION_USER].username){
		next();
	} else {
		responseCodes.respond("Middleware: canCreateDatabase", req, res, next, responseCodes.AUTH_ERROR, null, req.params);
	}
}



function freeSpace(account){
	'use strict';

	let limits;

	//console.log('checking free space');
	return User.findByUserName(account).then( dbUser => {

		limits = dbUser.getSubscriptionLimits();
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

		limits = dbUser.getSubscriptionLimits();

		return ProjectSetting.findById({account}, project);

	}).then(projectSetting => {

		if(limits.collaboratorLimit - projectSetting.collaborators.length > 0){
			next();
		} else {
			responseCodes.respond("", req, res, next, responseCodes.COLLABORATOR_LIMIT_EXCEEDED , null, {});
		}

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

function isAccountAdmin(req, res, next){
	'use strict';

	let username = req.session.user.username;
	let account = req.params.account;
	let foundAdminRole;

	User.findByUserName(username).then(user => {


		let findPromises = [];

		if(!user){
			return Promise.reject();
		}

		user.roles.forEach(role => {
			if (role.db === account){
				findPromises.push(
					Role.findByRoleID(`${account}.${role.role}`).then(detailRole => {
						!foundAdminRole && (foundAdminRole = detailRole.roles.find(role => role.db === account && role.role === 'readWrite'));
					})
				);
			}
		});

		return Promise.all(findPromises);

	}).then(() => {

		console.log('foundAdminRole', foundAdminRole);
		if(foundAdminRole){
			next();
		} else {
			return Promise.reject();
		}

	}).catch(() => {
		responseCodes.respond("Middleware: isAccountAdmin", req, res, next, responseCodes.AUTH_ERROR, null, req.params);
	});

}

var middlewares = {

	// Real middlewares taking req, res, next
	hasReadAccessToProject: [loggedIn, hasReadAccessToProject],
	hasWriteAccessToProject: [loggedIn, hasWriteAccessToProject],
	hasReadAccessToAccount: [loggedIn, hasReadAccessToAccount],
	hasWriteAccessToAccount: [loggedIn, hasWriteAccessToAccount],
	hasWriteAccessToIssue: [loggedIn, hasWriteAccessToIssue],
	isAccountAdmin: [loggedIn, isAccountAdmin],
	hasCollaboratorQuota: [loggedIn, hasCollaboratorQuota],

	canCreateDatabase,
	connectQueue,

	// Helpers
	freeSpace,
	loggedIn,
	checkRole,
	hasReadAccessToProjectHelper,
	createQueueInstance
};

module.exports = middlewares;
