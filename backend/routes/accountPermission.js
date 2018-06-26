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

(function() {
	"use strict";

	const express = require("express");
	const router = express.Router({mergeParams: true});
	const responseCodes = require("../response_codes");
	const middlewares = require("../middlewares/middlewares");
	const User = require("../models/user");
	const utils = require("../utils");
	const _ = require("lodash");

	router.get("/permissions", middlewares.isAccountAdmin, listPermissions);
	router.post("/permissions", middlewares.isAccountAdmin, createPermission);
	router.put("/permissions/:user", middlewares.isAccountAdmin, updatePermission);
	router.delete("/permissions/:user", middlewares.isAccountAdmin, deletePermission);


	function listPermissions(req, res, next){

		User.findByUserName(req.params.account).then(user => {
			let permissions = user.toObject().customData.permissions;
			return User.getAllUsersInTeamspace(req.params.account).then(users => {
		
				users.forEach( user => {
					if(!_.find(permissions, {"user" : user})) {
						permissions.push({user, permissions: []});
					}
				});
				responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, permissions);
			
			});

		}).catch(err => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});

	}

	function createPermission(req, res, next){

		if (Object.keys(req.body).length === 2 &&
			Object.prototype.toString.call(req.body.user) === "[object String]" &&
			Object.prototype.toString.call(req.body.permissions) === "[object Array]") {
			
			User.findByUserName(req.params.account).then(user => {

				return user.customData.permissions.add(req.body);

			}).then(permission => {
				responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, permission);
			}).catch(err => {
				responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
			});
		} else {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.INVALID_ARGUMENTS, responseCodes.INVALID_ARGUMENTS);
		}


		
	}

	function updatePermission(req, res, next){
		
		if (Object.keys(req.body).length === 1 &&
			Object.prototype.toString.call(req.body.permissions) === "[object Array]") {
			User.findByUserName(req.params.account).then(user => {
				return user.customData.permissions.update(req.params.user, req.body);

			}).then(permission => {
				responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, permission);
			}).catch(err => {
				responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
			});
		} else {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.INVALID_ARGUMENTS, responseCodes.INVALID_ARGUMENTS);
		}

	}

	function deletePermission(req, res, next){

		User.findByUserName(req.params.account).then(user => {

			return user.customData.permissions.remove(req.params.user);

		}).then(() => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, {});

		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	module.exports = router;
}());
