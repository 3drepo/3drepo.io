/**
 *  Copyright (C) 2017 3D Repo Ltd
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
const _ = require("lodash");
const C	= require("../constants");
const getPermissionsAdapter = require("./getPermissionsAdapter");
const { validSession } = require(`${v5Path}/middleware/auth`);
const responseCodes = require("../response_codes");

// logic to check permissions
function checkPermissionsHelper(username, account, project, model, requiredPerms, getPermissions) {

	const getPermPromises = [];

	getPermPromises.push(getPermissions(account).accountLevel(username));

	// check what kind of permissions is requested before making db calls to save unnecessary db calls

	const flattenRequiredPerms = requiredPerms["$or"] ? _.flatten(requiredPerms["$or"]) : _.flatten(requiredPerms);

	if(_.intersection(C.PROJECT_PERM_LIST, flattenRequiredPerms).length > 0) {
		getPermPromises.push(getPermissions(account).projectLevel(username, project));
	}

	if(_.intersection(C.MODEL_PERM_LIST, flattenRequiredPerms).length > 0) {
		getPermPromises.push(getPermissions(account).modelLevel(username, model));
	}

	return Promise.all(getPermPromises).then(userPermissions => {

		userPermissions = _.flatten(userPermissions);

		// add implied and inherited permissions
		let impliedPerms = [];

		["account", "project", "model"].forEach(
			level => {
				impliedPerms = impliedPerms.concat(_.flatten(userPermissions.map(p => _.get(C.IMPLIED_PERM, `${p}.${level}`) || p)));
			}
		);

		userPermissions = _.uniq(impliedPerms);

		function hasRequiredPermissions(perms) {
			return _.difference(perms, userPermissions).length === 0;
		}

		// if it contains or relationship
		if(Array.isArray(requiredPerms["$or"])) {
			return { granted: requiredPerms["$or"].some(hasRequiredPermissions), userPermissions };
		}

		// return true if user has the requested permissions
		return { granted: hasRequiredPermissions(requiredPerms), userPermissions };
	});
}

const validateUserSession = (req, res) => new Promise((resolve) => {
	validSession(req, res, resolve);
});

function validatePermissions(next, result) {
	const results = _.isArray(result) ? result : [result];
	const isGranted = results.every((data) => data.granted);

	if (isGranted) {
		next();
	} else {
		return Promise.reject(responseCodes.NOT_AUTHORIZED);
	}
}

// function that returns a middleware function for checking permissions
function checkPermissions(permsRequest) {

	return function(req, res, next) {
		validateUserSession(req, res).then(() => {
			const username = req.session.user.username;
			const account = req.params.account;
			const model = req.params.model;
			const project = req.params.project;

			return checkPermissionsHelper(username, account, project, model, permsRequest, getPermissionsAdapter).then((data) => {
				if (data.userPermissions) {
					req.session.user.permissions = data.userPermissions;
				}
				return data;
			});
		}).then(validatePermissions.bind(null, next))
			.catch(err => {
				next(err);
			});
	};
}

function checkMultiplePermissions(permsRequest) {
	return async function(req, res, next) {
		const models = [];

		// POST request
		if (req.params.models) {
			models.push(...req.params.models.map(({model}) => model));
		}

		// GET request
		if (req.query.models) {
			models.push(...req.query.models.split(","));
		}

		// PATCH Request
		if(!models.length && req.body.length) {
			models.push(...req.body.flatMap((entry)=> entry?.model || []));
		}
		try {
			await validateUserSession(req, res);

			const username = req.session.user.username;
			const account = req.params.account;

			if(!models.length) {
				throw responseCodes.INVALID_ARGUMENTS;
			}

			const permRes = await Promise.all(models.map((model) => {
				return checkPermissionsHelper(username, account, null, model, permsRequest, getPermissionsAdapter);
			}));

			await validatePermissions(next, permRes);

		} catch (err) {
			next(err);
		}
	};
}

function hasReadAccessToModelHelper(username, account, model) {
	return checkPermissionsHelper(
		username,
		account,
		"",
		model,
		[C.PERM_VIEW_MODEL],
		getPermissionsAdapter
	).then(data => data.granted);
}

function hasWriteAccessToModelHelper(username, account, model) {
	return checkPermissionsHelper(
		username,
		account,
		"",
		model,
		[C.PERM_CREATE_ISSUE],
		getPermissionsAdapter
	).then(data => data.granted);
}

function isAccountAdminHelper(username, account, model) {
	return checkPermissionsHelper(
		username,
		account,
		"",
		model,
		[C.PERM_TEAMSPACE_ADMIN],
		getPermissionsAdapter
	).then(data => data.granted);
}

module.exports = {
	checkPermissions,
	checkPermissionsHelper,
	checkMultiplePermissions,
	hasReadAccessToModelHelper,
	hasWriteAccessToModelHelper,
	isAccountAdminHelper,
	validateUserSession
};
