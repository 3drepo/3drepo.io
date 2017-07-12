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
	const ModelSetting = require('../models/modelSetting');
	// var History = require('../models/history');
	const User = require('../models/user');
	const utils = require("../utils");
	const config = require('../config');

	// init ampq and import queue object
	const importQueue = require('../services/queue');
	const getPermissionsAdapter = require('./getPermissionsAdapter');
	const checkPermissionsHelper = require('./checkPermissions').checkPermissionsHelper;
	const checkPermissions = require('./checkPermissions').checkPermissions;

	const readAccessToModel = [C.PERM_VIEW_MODEL];


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
		let model = req.params.model;

		return User.findByUserName(account).then( dbUser => {

			limits = dbUser.customData.billing.subscriptions.getSubscriptionLimits();

			return ModelSetting.findById({account}, model);

		}).then(modelSetting => {

			if(limits.collaboratorLimit - modelSetting.collaborators.length > 0){
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

	function hasReadAccessToModelHelper(username, account, model){
		return checkPermissionsHelper(
			username, 
			account, 
			'',
			model, 
			readAccessToModel,
			getPermissionsAdapter
		).then(data => data.granted);
	}

	function isAccountAdminHelper(username, account, model){
		return checkPermissionsHelper(
			username, 
			account, 
			'',
			model, 
			[C.PERM_TEAMSPACE_ADMIN],
			getPermissionsAdapter
		).then(data => data.granted);
	}

	function canCreateModel(req, res, next){
		if(req.body.subModels){
			checkPermissions([C.PERM_CREATE_FEDERATION])(req, res, next);
		} else {
			checkPermissions([C.PERM_CREATE_MODEL])(req, res, next);
		}
	}

	var middlewares = {

		project: require('./project'),
		job: require('./job'),
		issue: require('./issue'),

		//models
		canCreateModel: canCreateModel,
		hasReadAccessToModel: checkPermissions(readAccessToModel),
		hasUploadAccessToModel: checkPermissions([C.PERM_UPLOAD_FILES]),
		hasWriteAccessToModelSettings: checkPermissions([C.PERM_CHANGE_MODEL_SETTINGS]),
		hasDeleteAccessToModel: checkPermissions([C.PERM_DELETE_MODEL]),
		hasDownloadAccessToModel: checkPermissions([C.PERM_DOWNLOAD_MODEL]),
		hasEditAccessToFedModel: checkPermissions([C.PERM_EDIT_FEDERATION]),
		hasDeleteAccessToFedModel: checkPermissions([C.PERM_DELETE_FEDERATION]),
		hasEditPermissionsAccessToModel: checkPermissions([C.PERM_MANAGE_MODEL_PERMISSION]),

		isAccountAdmin: checkPermissions([C.PERM_TEAMSPACE_ADMIN]),
		hasCollaboratorQuota: [loggedIn, hasCollaboratorQuota],
		connectQueue,
		loggedIn,

		// Helpers
		// checkPermissions,
		freeSpace,
		hasReadAccessToModelHelper,
		isAccountAdminHelper,
		createQueueInstance,
		checkPermissionsHelper,

	};

	module.exports = middlewares;


})();