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
	const router = express.Router({mergeParams: true});
	const responseCodes = require("../response_codes");
	const middlewares = require("../middlewares/middlewares");
	const User = require("../models/user");
	const utils = require("../utils");
	const PermissionTemplates = require("../models/permissionTemplates");

	/**
	 * @apiDefine PermissionTemplate Permission Template
	 * Permission template is a grouping of model level permissions.
	 * An ID is assigned to it as well.
	 * They are viewer, commenter, and collaborator.
	 *
	 * Three default permission templates are created by default.
	 * They are viewer, commenter, and collaborator.
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 */

	/**
	 * @apiDefine GetPermissionTemplates
	 *
	 * @apiSuccessExample {json} Success-Response
	 * HTTP/1.1 200 OK
	 * [
	 * 	{
	 * 		"_id":"Template1",
	 * 		"permissions":[
	 * 			"view_model"
	 * 		]
	 * 	},
	 * 	{
	 * 		"_id":"Template2",
	 * 		"permissions":[
	 * 			"view_model",
	 * 			"view_issue"
	 * 		]
	 * 	}
	 * ]
	 */

	/**
	 * @api {post} /:teamspace/permission-templates Create a template
	 * @apiName createTemplate
	 * @apiGroup PermissionTemplate
	 * @apiDescription Create a permission template.
	 *
	 * @apiUse PermissionTemplate
	 *
	 * @apiParam (Request body) {String} _id Template name
	 * @apiParam (Request body) {String[]} permissions List of model level permissions
	 * @apiSuccess {String} _id Template name
	 * @apiSuccess {String[]} permissions List of model level permissions
	 *
	 * @apiExample {post} Example usage:
	 * POST /acme/permission-templates HTTP/1.1
	 * {
	 * 	"_id":"Template1",
	 * 	"permissions":[
	 * 		"view_model"
	 * 	]
	 * }
	 *
	 * @apiSuccessExample {json} Success-Response
	 * HTTP/1.1 200 OK
	 * {
	 * 	"_id":"Template1",
	 * 	"permissions":[
	 * 		"view_model"
	 * 	]
	 * }
	 */
	router.post("/permission-templates", middlewares.isAccountAdmin, createTemplate);

	/**
	 * @api {get} /:teamspace/permission-templates Get all templates
	 * @apiName listTemplates
	 * @apiGroup PermissionTemplate
	 * @apiDescription Get a list of teamspace permission templates.
	 *
	 * @apiUse PermissionTemplate
	 * @apiUse GetPermissionTemplates
	 *
	 * @apiExample {get} Example usage:
	 * GET /acme/permission-templates HTTP/1.1
	 */
	router.get("/permission-templates", middlewares.isAccountAdmin, listTemplates);

	/**
	 * @api {get} /:teamspace/:model/permission-templates List all model templates
	 * @apiName listModelTemplates
	 * @apiGroup PermissionTemplate
	 * @apiDescription Get a list of model permission templates.
	 * Intended for users that have `manage_model_permission` privileges.
	 *
	 * @apiUse PermissionTemplate
	 * @apiUse GetPermissionTemplates
	 *
	 * @apiParam {String} model Model ID
	 *
	 * @apiExample {get} Example usage:
	 * GET /acme/00000000-0000-0000-0000-000000000000/permission-templates HTTP/1.1
	 */
	router.get("/:model/permission-templates", middlewares.hasEditPermissionsAccessToModel, listTemplates);

	/**
	 * @api {delete} /:teamspace/permission-templates/:permissionId Delete a template
	 * @apiName deleteTemplate
	 * @apiGroup PermissionTemplate
	 * @apiDescription Delete a permission template.
	 *
	 * @apiUse PermissionTemplate
	 *
	 * @apiParam {String} permissionId Permission ID
	 *
	 * @apiExample {delete} Example usage:
	 * DELETE /acme/permission-templates/Template1 HTTP/1.1
	 *
	 * @apiSuccessExample {json} Success-Response
	 * HTTP/1.1 200 OK
	 * {}
	 */
	router.delete("/permission-templates/:permissionId", middlewares.isAccountAdmin, deleteTemplate);

	function listTemplates(req, res, next) {
		User.findByUserName(req.params.account).then(user => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, PermissionTemplates.get(user));
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

			return PermissionTemplates.add(user, permission);

		}).then(permission => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, permission);

		}).catch(err => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});

	}

	function deleteTemplate(req, res, next) {

		User.findByUserName(req.params.account).then(user => {

			return PermissionTemplates.remove(user, req.params.permissionId);

		}).then(() => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, {});

		}).catch(err => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	module.exports = router;
}());
