/**
 *	Copyright (C) 2017 3D Repo Ltd
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
(function() {
	const express = require("express");
	const router = express.Router({ mergeParams: true });
	const responseCodes = require("../response_codes");
	const middlewares = require("../middlewares/middlewares");
	const User = require("../models/user");
	const utils = require("../utils");
	const _ = require("lodash");

	/**
	 * @api {get} /:teamspace/permissions/ List all permissions
	 * @apiName listPermissions
	 * @apiGroup Account Permission
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 *
	 * @apiDescription List all account level permissions
	 * @apiSuccess (200) {String} user Current user account
	 * @apiSuccess (200) {String[]} permissions Account level permissions
	 *
	 * @apiSuccessExample {json} Success-Response:
	 *  HTTP/1.1 200 OK
	 *	[
	 *	   {
	 *		 "user": "username",
	 *		 "permissions": [
	 *			 "teamspace_admin"
	 *		 ]
	 *	   }
	 *	]
	 *
	  * @apiError NOT_AUTHORIZED Not Authorized
	 * @apiErrorExample {json} Error-Example
	 * HTTP/1.1 401 Unauthorized
	 *	{
	 *	  "message": "Not Authorized",
	 *	  "status": 401,
	 *	  "code": "NOT_AUTHORIZED",
	 *	  "value": 9,
	 *	  "place": "GET /permissions"
	 *	}
	 */

	router.get("/permissions", middlewares.isAccountAdmin, listPermissions);

	/**
	 * @api {post} /:teamspace/permissions/ Create a permission
	 * @apiName createPermission
	 * @apiGroup Account Permission
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 *
	 * @apiDescription Create a new account permissions
	 * @apiSuccess (200) {String[]} permissions Account Level Permission types
	 *
	 * @apiSuccessExample {json} Success-Response:
	 *  HTTP/1.1 200 OK
	 *	[
	 *	   {
	 *		 "user": "username1",
	 *		 "permissions": [
	 *			 "permission_type"
	 *		 ]
	 *	   }
	 *	]
	 *
	 * @apiError Missing or invalid arguments
	 * @apiErrorExample {json} Error-Response
	 * HTTP/1.1 400 Bad Request
	 *	{
	 *	  "message": "Missing or invalid arguments",
	 *	  "status": 400,
	 *	  "code": "INVALID_ARGUMENTS",
	 *	  "value": 10,
	 *	  "place": "POST /permissions"
	 *	}
	 */
	router.post("/permissions", middlewares.isAccountAdmin, createPermission);

	/**
	 * @api {put} /:teamspace/permissions/:user Update a permission
	 * @apiName updatePermission
	 * @apiGroup Account Permission
	 *
	 * @apiDescription Create a new account level permission for a user.
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 * @apiParam {String} user User to update
	 * @apiSuccessExample {json} Success-Response
	 *
	 * HTTP/1.1 200 OK
	 * [
	 *	 {
	 *	  "model": "model_ID",
	 *	  "name": "model_name",
	 *	  "permissions": [
	 *		  {
	 *			  "user": "username1"
	 *		  },
	 *		  {
	 *			  "user": "username2"
	 *		  }
	 *	  ],
	 *	  "subModels": []
	 *	 }
	 * ]
	 */

	router.put("/permissions/:user", middlewares.isAccountAdmin, updatePermission);

	/**
	 * @api {delete} /:teamspace/permissions/:user Delete a permission
	 * @apiName deletePermission
	 * @apiGroup Account Permission
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 * @apiParam {String} user User to delete
	 *
	 * @apiDescription Update an existing permission for a teamspace member.
	 *
	 * @apiError Missing or invalid arguments
	 * @apiErrorExample
	 *
	 * HTTP/1.1 401 Unauth­orized
	 *	{
	 *	  "message": "Missing or invalid arguments",
	 *	  "status": 401,
	 *	  "code": "NOT_AUTHORIZED",
	 *	  "value": 9,
	 *	  "place": "GET /permissions"
	 *	}
	 */

	router.delete("/permissions/:user", middlewares.isAccountAdmin, deletePermission);

	function listPermissions(req, res, next) {
		User.findByUserName(req.params.account)
			.then(user => {
				const permissions = user.toObject().customData.permissions;
				return User.getAllUsersInTeamspace(req.params.account).then(
					users => {
						users.forEach(_user => {
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
				User.findByUserName(req.params.account)
					.then(user => {
						return user.customData.permissions.add(req.body);
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
			console.log(req.params.account, req.params.user);
			if(req.params.account === req.params.user) {
				responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OWNER_MUST_BE_ADMIN);
			} else {
				User.findByUserName(req.params.account)
					.then(user => {
						return user.customData.permissions.update(req.params.user, req.body);
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
		User.findByUserName(req.params.account)
			.then(user => {
				return user.customData.permissions.remove(req.params.user);
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
