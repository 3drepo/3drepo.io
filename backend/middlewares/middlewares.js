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

"use strict";
(() => {

	const responseCodes = require("../response_codes");
	const C				= require("../constants");
	const ModelSetting = require("../models/modelSetting");
	// var History = require('../models/history');
	const User = require("../models/user");
	const utils = require("../utils");
	const config = require("../config");

	const checkPermissionsHelper = require("./checkPermissions").checkPermissionsHelper;
	const checkPermissions = require("./checkPermissions").checkPermissions;
	const checkMultiplePermissions = require("./checkPermissions").checkMultiplePermissions;
	const hasReadAccessToModelHelper = require("./checkPermissions").hasReadAccessToModelHelper;
	const isAccountAdminHelper = require("./checkPermissions").isAccountAdminHelper;
	const validateUserSession = require("./checkPermissions").validateUserSession;

	const readAccessToModel = [C.PERM_VIEW_MODEL];

	function skipLoggedIn(req) {

		const loginIgnores = [
			"/config.js",
			"/version.json"
		];

		return loginIgnores.indexOf(req.url) !== -1;

	}

	function loggedIn(req, res, next) {
		if (skipLoggedIn(req)) {
			next();
		} else if (!req.session || !req.session.hasOwnProperty(C.REPO_SESSION_USER)) {
			responseCodes.respond("Check logged in middleware", req, res, next, responseCodes.AUTH_ERROR, null, req.params);
		} else {
			next();
		}
	}

	function freeSpace(account) {

		let limits;
		return User.findByUserName(account).then(dbUser => {

			limits = dbUser.customData.billing.getSubscriptionLimits();
			return User.getTeamspaceSpaceUsed(account);

		}).then(totalSize => {
			totalSize /= 1024 * 1024;
			return Promise.resolve(limits.spaceLimit - totalSize);
		});

	}

	function isTeamspaceMember(req, res, next) {
		return validateUserSession(req).then(() => {
			const teamspace = req.params.account;
			const user = req.session.user.username;
			return User.teamspaceMemberCheck(teamspace, user).then(() => {
				next();
			}).catch(err => {
				responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
			});
		}).catch((err) => {
			next(err);
		});
	}

	function hasCollaboratorQuota(req, res, next) {

		let limits;

		const account = req.params.account;
		const model = req.params.model;

		return User.findByUserName(account).then(dbUser => {

			limits = dbUser.customData.billing.getSubscriptionLimits();

			return ModelSetting.findById({account}, model);

		}).then(modelSetting => {

			if(limits.collaboratorLimit - modelSetting.collaborators.length > 0) {
				next();
			} else {
				responseCodes.respond("", req, res, next, responseCodes.COLLABORATOR_LIMIT_EXCEEDED , null, {});
			}

		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err.resCode ? err.resCode : err, err.resCode ? err.resCode : err);
		});
	}

	function canCreateModel(req, res, next) {
		if(req.body.subModels) {
			checkPermissions([C.PERM_CREATE_FEDERATION])(req, res, next);
		} else {
			checkPermissions([C.PERM_CREATE_MODEL])(req, res, next);
		}
	}

	function isHereEnabled(req, res, next) {
		const teamspace = req.params.account;

		if (config.here && config.here.appID && config.here.appCode) {
			return User.isHereEnabled(teamspace).then((hereEnabled) => {
				if (hereEnabled) {
					next();
				} else {
					responseCodes.respond("Check Here enabled middleware", req, res, next, responseCodes.HERE_MAPS_NOT_AVAILABLE , null, {});
				}
			}).catch(err => {
				responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
			});
		} else {
			responseCodes.respond("Check Here enabled middleware", req, res, next, responseCodes.MISSING_HERE_CONFIG , null, {});
		}
	}

	const middlewares = {

		project: require("./project"),
		job: require("./job"),
		issue: require("./issue"),
		notification: require("./notification"),
		chat: require("./chat"),

		isHereEnabled: isHereEnabled,

		// models
		canCreateModel: canCreateModel,
		hasReadAccessToModel: checkPermissions(readAccessToModel),
		hasUploadAccessToModel: checkPermissions([C.PERM_UPLOAD_FILES]),
		hasWriteAccessToModelSettings: checkPermissions([C.PERM_CHANGE_MODEL_SETTINGS]),
		hasDeleteAccessToModel: checkPermissions([C.PERM_DELETE_MODEL]),
		hasDownloadAccessToModel: checkPermissions([C.PERM_DOWNLOAD_MODEL]),
		hasEditAccessToFedModel: checkPermissions([C.PERM_EDIT_FEDERATION]),
		hasDeleteAccessToFedModel: checkPermissions([C.PERM_DELETE_FEDERATION]),
		hasEditPermissionsAccessToModel: checkPermissions([C.PERM_MANAGE_MODEL_PERMISSION]),
		hasEditPermissionsAccessToMulitpleModels: checkMultiplePermissions([C.PERM_MANAGE_MODEL_PERMISSION]),

		isAccountAdmin: checkPermissions([C.PERM_TEAMSPACE_ADMIN]),
		hasCollaboratorQuota: [loggedIn, hasCollaboratorQuota],
		isTeamspaceMember,
		loggedIn,

		// Helpers
		// checkPermissions,
		freeSpace,
		hasReadAccessToModelHelper,
		isAccountAdminHelper,
		checkPermissionsHelper

	};

	module.exports = middlewares;

})();
