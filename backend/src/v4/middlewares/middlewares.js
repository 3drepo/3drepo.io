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

const { v5Path } = require("../../interop");
const responseCodes = require("../response_codes");
const C				= require("../constants");
const { findModelSettingById } = require("../models/modelSetting");
const User = require("../models/user");
const utils = require("../utils");
const config = require("../config");
const { formatV5NewModelParams } = require("./formatV5NewModelParams");

const checkPermissionsHelper = require("./checkPermissions").checkPermissionsHelper;
const checkPermissions = require("./checkPermissions").checkPermissions;
const checkMultiplePermissions = require("./checkPermissions").checkMultiplePermissions;
const hasReadAccessToModelHelper = require("./checkPermissions").hasReadAccessToModelHelper;
const isAccountAdminHelper = require("./checkPermissions").isAccountAdminHelper;

const { validSession } = require(`${v5Path}/middleware/auth`);
const { hasAccessToTeamspace } = require(`${v5Path}/middleware/permissions`);
const { notUserProvisioned } = require(`${v5Path}/middleware/permissions/components/teamspaces`);

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
	} else {
		validSession(req,res,next);
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
	req.params.teamspace = req.params.account;
	return hasAccessToTeamspace(req, res, next);
}

const checkTeamspaceAccess = (nextMiddleware) => (req, res, next) => {
	isTeamspaceMember(req, res, () => nextMiddleware(req, res, next));
};

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

function flagAsV4Request(req, res, next) {
	req.v4 = true;
	next();
}

function formatV5LogInData(req, res, next) {
	if (req.body.username) {
		req.body.user = req.body.username;
		delete req.body.username;
	}
	next();
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
		req.body.containers = req.body.subModels.map(({model}) => ({ _id: model }));
	}

	next();
}

const middlewares = {
	project: require("./project"),
	notification: require("./notification"),
	chat: require("./chat"),

	isHereEnabled: isHereEnabled,

	// models
	canAddOrRemoveUsers: [checkTeamspaceAccess(checkPermissions([C.PERM_TEAMSPACE_ADMIN])), formatV5NewModelParams, notUserProvisioned],
	canCreateModel: checkTeamspaceAccess(canCreateModel),
	hasReadAccessToModel: checkTeamspaceAccess(checkPermissions(readAccessToModel)),
	hasCommenterAccessToModel: checkTeamspaceAccess(checkPermissions([C.PERM_CREATE_ISSUE])),
	hasViewIssueAccessToModel: checkTeamspaceAccess(checkPermissions([C.PERM_VIEW_ISSUE])),
	hasUploadAccessToModel: checkTeamspaceAccess(checkPermissions([C.PERM_UPLOAD_FILES])),
	hasWriteAccessToModelSettings: checkTeamspaceAccess(checkPermissions([C.PERM_CHANGE_MODEL_SETTINGS])),
	hasDeleteAccessToModel: checkTeamspaceAccess(checkPermissions([C.PERM_DELETE_MODEL])),
	hasDownloadAccessToModel: checkTeamspaceAccess(checkPermissions([C.PERM_DOWNLOAD_MODEL])),
	hasEditAccessToFedModel: checkTeamspaceAccess(checkPermissions([C.PERM_EDIT_FEDERATION])),
	hasDeleteAccessToFedModel: checkTeamspaceAccess(checkPermissions([C.PERM_DELETE_FEDERATION])),
	hasEditPermissionsAccessToModel: checkTeamspaceAccess(checkPermissions([C.PERM_MANAGE_MODEL_PERMISSION])),
	hasEditPermissionsAccessToMulitpleModels: checkTeamspaceAccess(checkMultiplePermissions([C.PERM_MANAGE_MODEL_PERMISSION])),
	isAccountAdmin: checkTeamspaceAccess(checkPermissions([C.PERM_TEAMSPACE_ADMIN])),
	hasCollaboratorQuota: [loggedIn, hasCollaboratorQuota],
	isTeamspaceMember,
	loggedIn,

	// Helpers
	// checkPermissions,
	freeSpace,
	checkSufficientSpace,
	hasReadAccessToModelHelper,
	isAccountAdminHelper,
	checkPermissionsHelper,

	// v5 converters
	formatV5LogInData,
	formatV5NewModelParams,
	formatV5NewModelRevisionsData,
	formatV5NewFedRevisionsData,
	flagAsV4Request
};

module.exports = middlewares;
