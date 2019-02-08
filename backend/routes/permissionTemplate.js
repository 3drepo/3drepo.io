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
	const router = express.Router({mergeParams: true});
	const responseCodes = require("../response_codes");
	const middlewares = require("../middlewares/middlewares");
	const User = require("../models/user");
	const utils = require("../utils");

	/**
	 * @api {post} /:teamspace/permission-templates Create a Permission Template
	 * @apiName createTemplate
	 * @apiGroup Permission Template
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 */

	router.post("/permission-templates", middlewares.isAccountAdmin, createTemplate);

	/**
	 * @api {get} /:teamspace/permission-templates List all Permission Templates
	 * @apiName listTemplates
	 * @apiGroup Permission Template
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 */

	router.get("/permission-templates", middlewares.isAccountAdmin, listTemplates);

	/**
	 * @api {get} /:teamspace/:model/permission-templates List all Permission Templates based on Model
	 * @apiName listTemplates
	 * @apiGroup Permission Template
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 * @apiParam {String} model Model ID to get permission templates for.
	 */

	router.get("/:model/permission-templates", middlewares.hasEditPermissionsAccessToModel, listTemplates);

	/**
	 * @api {delete} /:teamspace/permission-templates/:permissionId Delete permission template
	 * @apiName deleteTemplate
	 * @apiGroup Permission Template
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 * @apiParam {String} permissionId Unique Permission ID
	 */

	router.delete("/permission-templates/:permissionId", middlewares.isAccountAdmin, deleteTemplate);

	function listTemplates(req, res, next) {

		User.findByUserName(req.params.account).then(user => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, user.customData.permissionTemplates.get());

		}).catch(err => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	function createTemplate(req, res, next) {

		User.findByUserName(req.params.account).then(user => {

			const permission = {
				_id: req.body._id,
				permissions: req.body.permissions
			};

			return user.customData.permissionTemplates.add(permission);

		}).then(permission => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, permission);
		}).catch(err => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});

	}

	function deleteTemplate(req, res, next) {

		User.findByUserName(req.params.account).then(user => {

			return user.customData.permissionTemplates.remove(req.params.permissionId);

		}).then(() => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, {});

		}).catch(err => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	module.exports = router;
}());
