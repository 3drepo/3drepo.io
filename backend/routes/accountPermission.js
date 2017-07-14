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

	const express = require('express');
	const router = express.Router({mergeParams: true});
	const responseCodes = require('../response_codes');
	const middlewares = require('../middlewares/middlewares');
	const User = require("../models/user");
	const utils = require("../utils");

	router.get("/permissions", middlewares.isAccountAdmin, listPermissions);
	router.post("/permissions", middlewares.isAccountAdmin, createPermission);
	router.put("/permissions/:user", middlewares.isAccountAdmin, updatePermission);
	router.delete("/permissions/:user", middlewares.isAccountAdmin, deletePermission);


	function listPermissions(req, res, next){

		User.findByUserName(req.params.account).then(user => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, user.toObject().customData.permissions);
		}).catch(err => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});

	}

	function createPermission(req, res, next){

		User.findByUserName(req.params.account).then(user => {

			return user.customData.permissions.add(req.body);

		}).then(permission => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, permission);
		}).catch(err => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
		
	}

	function updatePermission(req, res, next){

		User.findByUserName(req.params.account).then(user => {

			return user.customData.permissions.update(req.params.user, req.body);

		}).then(permission => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, permission);
		}).catch(err => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
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
