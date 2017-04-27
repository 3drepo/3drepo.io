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
(() => {
	"use strict";


	const responseCodes = require('../response_codes');
	const C				= require("../constants");
	const ProjectSetting = require('../models/projectSetting');
	// var History = require('../models/history');
	const User = require('../models/user');
	const utils = require("../utils");
	const config = require('../config');
	const Project = require('../models/project');

	// init ampq and import queue object
	const importQueue = require('../services/queue');


	// get permissions adapter
	function getPermissionsAdapter(account) {

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
					const permission = user.customData.permissions.findByUser(username);
					return permission && permission.permissions;
				});
			},

			projectLevel: function(username, projectGroup){

				return Project.findOne({account}, { name: projectGroup}).then(project => {
					return project.findPermsByUser(username).permissions;
				});
			},

			modelLevel: function(username, project){
				let user;

				return this.getUser().then(_user => {
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

			let checkLogin = Promise.resolve();

			if (!req.session || !req.session.hasOwnProperty(C.REPO_SESSION_USER)) {
				checkLogin = Promise.reject(responseCodes.NOT_LOGGED_IN);
			}

			checkLogin.then(() => {

				const username = req.session.user.username;
				const account = req.params.account;
				const project = req.params.project;
				const projectGroup = req.params.projectGroup;

				return checkPermissionsHelper(username, account, projectGroup, project, permsRequest, getPermissionsAdapter);

			}).then(granted => {

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

	function loggedIn(req, res, next){

		if (!req.session || !req.session.hasOwnProperty(C.REPO_SESSION_USER)) {
			responseCodes.respond("Check logged in middleware", req, res, next, responseCodes.AUTH_ERROR, null, req.params);
		} else {
			next();
		}
	}

	function freeSpace(account){

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

	function hasReadAccessToModelHelper(username, account, project){
		return checkPermissionsHelper(
			username, 
			account, 
			'',
			project, 
			[C.PERM_VIEW_MODEL],
			getPermissionsAdapter
		);
	}

	function isAccountAdminHelper(username, account){
		return checkPermissionsHelper(
			username, 
			account, 
			'',
			project, 
			[C.PERM_TEAMSPACE_ADMIN],
			getPermissionsAdapter
		);
	}

	var middlewares = {


		//issues
		hasWriteAccessToIssue: checkPermissions([C.PERM_CREATE_ISSUE]),
		hasCommentAccessToIssue: checkPermissions([C.PERM_COMMENT_ISSUE]),
		hasReadAccessToIssue: checkPermissions([C.PERM_VIEW_ISSUE]),

		//models
		hasReadAccessToModel: checkPermissions([C.PERM_VIEW_MODEL]),
		hasUploadAccessToModel: checkPermissions([C.PERM_UPLOAD_FILES]),
		hasWriteAccessToModelSettings: checkPermissions([C.PERM_CHANGE_MODEL_SETTINGS]),
		hasDeleteAccessToModel: checkPermissions([C.PERM_DELETE_MODEL]),
		hasDownloadAccessToModel: checkPermissions([C.PERM_DOWNLOAD_MODEL]),
		hasEditAccessToFedModel: checkPermissions([C.PERM_EDIT_FEDERATION]),
		hasDeleteAccessToFedModel: checkPermissions([C.PERM_DELETE_FEDERATION]),

		isAccountAdmin: checkPermissions([C.PERM_TEAMSPACE_ADMIN]),
		hasCollaboratorQuota: [loggedIn, hasCollaboratorQuota],
		connectQueue,
		loggedIn,

		// Helpers
		checkPermissions,
		freeSpace,
		hasReadAccessToModelHelper,
		isAccountAdminHelper,
		createQueueInstance,
		checkPermissionsHelper,

	};

	module.exports = middlewares;


})();