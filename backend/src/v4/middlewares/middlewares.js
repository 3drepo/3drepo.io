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

"use strict";
(() => {

	const responseCodes = require("../response_codes");
	const C				= require("../constants");
	const { findModelSettingById } = require("../models/modelSetting");
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
	const sessionCheck = require("./sessionCheck");

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
		} else if (!sessionCheck(req)) {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.NOT_LOGGED_IN, null, {});
		} else {
			next();
		}
	}

	function freeSpace(account) {

		let limits;
		return User.findByUserName(account).then(dbUser => {

			limits = User.getSubscriptionLimits(dbUser);
			return User.getTeamspaceSpaceUsed(account);

		}).then(totalSize => {
			totalSize /= 1024 * 1024;
			return Promise.resolve(limits.spaceLimit - totalSize);
		});

	}

	async function checkSufficientSpace(account, size) {
		if (size > config.uploadSizeLimit) {
			throw responseCodes.SIZE_LIMIT;
		}

		const sizeInMB = size / (1024 * 1024);
		const space = await freeSpace(account);

		if (sizeInMB > space) {
			throw responseCodes.SIZE_LIMIT_PAY;
		}
	}

	function isTeamspaceMember(req, res, next) {
		return validateUserSession(req).then(() => {
			const teamspace = req.params.account;
			const user = req.session.user.username;
			return User.teamspaceMemberCheck(user, teamspace).then(() => {
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

			limits = User.getSubscriptionLimits(dbUser);

			return findModelSettingById(account, model);

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

		if (config.here && config.here.apiKey) {
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

	function isAccountAdminOrSameUser(req, res, next) {
		if (req.params.user ===  req.session.user.username) {
			next();
			return;
		}

		checkPermissions([C.PERM_TEAMSPACE_ADMIN])(req, res, next);
	}

	function formatV5NewModelRevisionsData(req, res, next) {
		req.params.teamspace = req.params.account;
		req.params.container = req.params.model;
		next();
	}

	async function formatV5NewFedRevisionsData(req, res, next) {
		req.params.teamspace = req.params.account;
		req.params.federation = req.params.model;

		const { findOneProject } = require("../models/project");

		try {
			const { _id : projectId} = await findOneProject(req.params.teamspace, { models: req.params.federation}, {_id: 1});
			req.params.project = projectId;
		} catch(err) {
			// do nothing if it errored, the next middleware will sort this out.
		}

		if(req.body?.subModels?.length) {
			req.body.containers = req.body.subModels.map(({model}) => model);
		}

		next();
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
		formatV5NewModelRevisionsData,
		formatV5NewFedRevisionsData,
		isAccountAdmin: checkPermissions([C.PERM_TEAMSPACE_ADMIN]),
		isAccountAdminOrSameUser,
		hasCollaboratorQuota: [loggedIn, hasCollaboratorQuota],
		isTeamspaceMember,
		loggedIn,

		// Helpers
		// checkPermissions,
		freeSpace,
		checkSufficientSpace,
		hasReadAccessToModelHelper,
		isAccountAdminHelper,
		checkPermissionsHelper

	};

	module.exports = middlewares;

})();
