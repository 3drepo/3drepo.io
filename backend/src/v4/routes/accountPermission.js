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
(function() {
	const express = require("express");
	const router = express.Router({ mergeParams: true });
	const responseCodes = require("../response_codes");
	const middlewares = require("../middlewares/middlewares");
	const AccountPermissions = require("../models/accountPermissions");
	const User = require("../models/user");
	const { getTeamspaceSettings } = require("../models/teamspaceSetting");
	const utils = require("../utils");
	const _ = require("lodash");

	/**
	 * @api {get} /:teamspace/permissions List all permissions
	 * @apiName listPermissions
	 * @apiGroup Account Permission
	 * @apiDescription Get a list of all account permission objects for a teamspace
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 * @apiSuccess (200) {String} user User
	 * @apiSuccess (200) {String[]} permissions Account level permissions
	 *
	 * @apiExample {get} Example usage:
	 * GET /acme/permissions HTTP/1.1
	 *
	 * @apiSuccessExample {json} Success-Response:
	 * HTTP/1.1 200 OK
	 * [
	 * 	{
	 * 		"user": "alice",
	 * 		"permissions": [
	 * 			"teamspace_admin"
	 * 		]
	 * 	},
	 * 	{
	 * 		"user": "bob",
	 * 		"permissions": [
	 * 			"create_project"
	 * 		]
	 * 	}
	 * ]
	 */
	router.get("/permissions", middlewares.isAccountAdmin, listPermissions);

	/**
	 * @api {post} /:teamspace/permissions Assign permissions
	 * @apiName createPermission
	 * @apiGroup Account Permission
	 * @apiDescription Assign account level permission to a user
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 * @apiBody {String} user User to assign permissions to
	 * @apiBody {String[]} permissions List of account level permissions
	 * @apiSuccess (200) {String} user User
	 * @apiSuccess (200) {String[]} permissions Account Level Permission types
	 *
	 * @apiExample {post} Example usage:
	 * POST /acme/permissions HTTP/1.1
	 * {
	 * 	"user": "bob",
	 * 	"permissions": [
	 * 		"create_project"
	 * 	]
	 * }
	 *
	 * @apiSuccessExample {json} Success-Response:
	 * HTTP/1.1 200 OK
	 * [
	 * 	{
	 * 		"user": "bob",
	 * 		"permissions": [
	 * 			"create_project"
	 * 		]
	 * 	}
	 * ]
	 */
	router.post("/permissions", middlewares.isAccountAdmin, createPermission);

	/**
	 * @api {put} /:teamspace/permissions/:user Update permissions
	 * @apiName updatePermission
	 * @apiGroup Account Permission
	 * @apiDescription Update permissions assignment for a user.
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 * @apiParam {String} user User to update
	 * @apiBody {String[]} permissions List of account level permissions
	 * @apiSuccess (200) {String[]} permissions List of account level permissions
	 *
	 * @apiExample {put} Example usage:
	 * PUT /acme/permissions/alice HTTP/1.1
	 * {
	 * 	"permissions": [
	 * 		"teamspace_admin"
	 * 	]
	 * }
	 *
	 * @apiSuccessExample {json} Success-Response:
	 * HTTP/1.1 200 OK
	 * {
	 *	"permissions": [
	 *		"teamspace_admin"
	 * 	]
	 * }
	 */
	router.put("/permissions/:user", middlewares.isAccountAdmin, updatePermission);

	/**
	 * @api {delete} /:teamspace/permissions/:user Revoke permissions
	 * @apiName deletePermission
	 * @apiGroup Account Permission
	 * @apiDescription Revoke all permissions from a user.
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 * @apiParam {String} user User to delete
	 *
	 * @apiExample {delete} Example usage:
	 * DELETE /acme/permissions/alice HTTP/1.1
	 *
	 * @apiSuccessExample {json} Success-Response:
	 * HTTP/1.1 200 OK
	 * {}
	 */
	router.delete("/permissions/:user", middlewares.isAccountAdmin, deletePermission);

	function listPermissions(req, res, next) {
		getTeamspaceSettings(req.params.account)
			.then(settings => {
				const permissions = settings.permissions;

				return User.getAllUsersInTeamspace(req.params.account).then(
					users => {
						users.forEach(async _user => {
							if (
								!_.find(permissions, { user: _user })
							) {
								permissions.push({
									user: _user,
									permissions: []
								});
							}
						});
						responseCodes.respond(
							utils.APIInfo(req),
							req,
							res,
							next,
							responseCodes.OK,
							permissions
						);
					}
				);
			})
			.catch(err => {
				responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
			});
	}

	function createPermission(req, res, next) {
		if (Object.keys(req.body).length === 2 && Object.prototype.toString.call(req.body.user) === "[object String]" && Object.prototype.toString.call(req.body.permissions) === "[object Array]") {
			if(req.params.account === req.body.user) {
				responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OWNER_MUST_BE_ADMIN);
			} else {
				getTeamspaceSettings(req.params.account)
					.then(teamspace => {
						return AccountPermissions.updateOrCreate(teamspace, req.body.user, req.body.permissions, req.session.user.username);
					})
					.then(permission => {
						responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, permission);
					})
					.catch(err => {
						responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
					});
			}
		} else {

			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.INVALID_ARGUMENTS, responseCodes.INVALID_ARGUMENTS);
		}
	}

	function updatePermission(req, res, next) {
		if (Object.keys(req.body).length === 1 && Object.prototype.toString.call(req.body.permissions) === "[object Array]") {
			if(req.params.account === req.params.user) {
				responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OWNER_MUST_BE_ADMIN);
			} else {
				getTeamspaceSettings(req.params.account)
					.then(teamspace => {
						return AccountPermissions.update(teamspace, req.params.user, req.body.permissions, req.session.user.username);
					})
					.then(permission => {
						responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, permission);
					})
					.catch(err => {
						responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
					});
			}
		} else {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.INVALID_ARGUMENTS, responseCodes.INVALID_ARGUMENTS);
		}
	}

	function deletePermission(req, res, next) {
		getTeamspaceSettings(req.params.account)
			.then(teamspaceSettings => {
				return AccountPermissions.remove(teamspaceSettings, req.params.user);
			})
			.then(() => {
				responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, {});
			})
			.catch(err => {
				responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
			});
	}

	module.exports = router;
}());
