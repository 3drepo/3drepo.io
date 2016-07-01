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

var _ = require('lodash');
var responseCodes = require('../response_codes');
var C               = require("../constants");
var Bid = require('../models/bid');
var ProjectSetting = require('../models/projectSetting');
// var History = require('../models/history');
var User = require('../models/user');
var config = require('../config');

var READ_BIT	= 4;
var WRITE_BIT	= 2;
// var EXECUTE_BIT	= 1;

var getDbColOptions = function(req){
	return {account: req.params.account, project: req.params.project};
};


function getAccessToProject(username, account, project){
	'use strict';

	return User.findByUserName(username).then(user => {
		return user.getPrivileges();

	}).then(privileges => {

		//Determine the access rights of a project via privileges on the history collection
		let collection = project + ".history";
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

function hasAccessToProject(req, res, next, permissionBit){
	'use strict';

	let username = req.session.user.username;
	let account = req.params.account;
	let project = req.params.project;

	return getAccessToProject(username, account, project).then(permissionFlag => {
		return Promise.resolve(permissionFlag & permissionBit);
	}).then(granted => {
		if(granted){
			next();
		} else {
			return Promise.reject(responseCodes.NOT_AUTHORIZED);
		}
	}).catch( err => {
		responseCodes.respond("Middleware: check has access to project", req, res, next, err , null, err);
	}); 
}

function hasWriteAccessToProject(req, res, next){
	return hasAccessToProject(req, res, next, WRITE_BIT);
}


function hasReadAccessToProject(req, res, next){
	return hasAccessToProject(req, res, next, READ_BIT); 
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

function canCreateProject(req, res, next){
	"use strict";
	
	if (req.params.account === req.session[C.REPO_SESSION_USER].username){
		next();
	} else {
		hasWriteAccessToProject(req, res, next);
	}
}
	
function loggedIn(req, res, next){
	'use strict';

	if (!(req.session.hasOwnProperty(C.REPO_SESSION_USER))) {
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

function isMainContractor(req, res, next){
	checkRole([C.REPO_ROLE_MAINCONTRACTOR], req).then(() => {
		next();
	}).catch(resCode => {
		responseCodes.respond("Middleware: check is main contractor", req, res, next, resCode, null, req.params);
	});
}

function isSubContractorInvitedHelper(req){
	'use strict';

	let filter = {
		user: req.session[C.REPO_SESSION_USER].username
	};

	if (req.params.packageName){
		filter.packageName = req.params.packageName;
	}
	return Bid.count(getDbColOptions(req), filter).then(count => {
		if (count > 0) {
			return Promise.resolve();
		} else {
			return Promise.reject(responseCodes.AUTH_ERROR);
		}
	});
}

function isSubContractorInvited(req, res, next){
	isSubContractorInvitedHelper(req).then(()=>{
		next();
	}).catch(resCode => {
		responseCodes.respond("Middleware: check is sub contractor invited", req, res, next, resCode, null, req.params);
	});
}

function canCreateDatabase(req, res, next){
	'use strict';

	if(!req.session[C.REPO_SESSION_USER] && req.body.verificationToken){

		let allowRepeatedVerify = true;
		User.verify(req.params.account, req.body.verificationToken, allowRepeatedVerify).then(() => {
			next();
		}).catch( err => {
			responseCodes.respond("Middleware: canCreateDatabase", req, res, next, responseCodes.AUTH_ERROR, null, err);
		});
		
	} else if (req.session[C.REPO_SESSION_USER] && req.params.account === req.session[C.REPO_SESSION_USER].username){
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

function connectQueue(req, res, next){
	'use strict';

	// init ampq and import queue object
	let importQueue = require('../services/queue');
	if(config.cn_queue){

		importQueue.connect(config.cn_queue.host, {

			sharedSpacePath: config.cn_queue.shared_storage,
			logger: req[C.REQ_REPO].logger,
			callbackQName: config.cn_queue.callback_queue,
			workerQName: config.cn_queue.worker_queue 

		}).then(() => {
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

	User.findByUserName(username).then(user => {

		if(!user){
			return Promise.reject();
		} else if(!user.hasRole(account, 'admin')){
			return Promise.reject();
		} else {
			next();
		}

	}).catch(() => {
		responseCodes.respond("Middleware: isAccountAdmin", req, res, next, responseCodes.AUTH_ERROR, null, req.params);
	});

}

var middlewares = {

	// Real middlewares taking req, res, next
	canCreateProject: [loggedIn, canCreateProject],
	hasReadAccessToProject: [loggedIn, hasReadAccessToProject],
	hasWriteAccessToProject: [loggedIn, hasWriteAccessToProject],
	hasReadAccessToAccount: [loggedIn, hasReadAccessToAccount],
	hasWriteAccessToAccount: [loggedIn, hasWriteAccessToAccount],
	isMainContractor: [loggedIn, isMainContractor],
	isSubContractorInvited: [loggedIn, isSubContractorInvited],
	isAccountAdmin: [loggedIn, isAccountAdmin],
	hasCollaboratorQuota: [loggedIn, hasCollaboratorQuota],

	canCreateDatabase,
	connectQueue,

	// Helpers
	freeSpace,
	isSubContractorInvitedHelper,
	loggedIn,
	checkRole
};

module.exports = middlewares;
