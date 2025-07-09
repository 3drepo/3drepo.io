/**
 *  Copyright (C) 2018 3D Repo Ltd
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
const express = require("express");
const router = express.Router({mergeParams: true});
const responseCodes = require("../response_codes");
const middlewares = require("../middlewares/middlewares");
const Invitations = require("../models/invitations");
const utils = require("../utils");

/**
 *
 * @api {get} /:teamspace/invitations Get invitations list
 * @apiName getInvitations
 * @apiGroup Invitations
 * @apiDescription It returns a list of invitations with their permissions and their jobs.
 *
 * @apiPermission teamSpaceAdmin
 *
 * @apiParam {String} teamspace Name of teamspace
 *
 * @apiExample {get} Example usage:
 * GET /teamSpace1/invitations HTTP/1.1
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * [
 *   {
 *     "email": "7e634bae01db4f@mail.com",
 *     "job": "jobA",
 *     "permissions": {
 *       "teamspace_admin": true
 *     }
 *   },
 *   {
 *     "email": "93393d28f953@mail.com",
 *     "job": "jobA",
 *     "permissions": {
 *       "projects": [
 *         {
 *           "project": '5bf7df65-f3a8-4337-8016-a63f00000000',
 *           "project_admin": true
 *         }
 *       ]
 *     }
 *   },
 *   {
 *     "email": "48bc8da2f3bc@mail.com",
 *     "job": "jobA",
 *     "permissions": {
 *       "projects": [
 *         {
 *           "project": '5bf7df65-f3a8-4337-8016-a63f00000000',
 *           "models": [
 *             {
 *               "model": "2710bd65-37d3-4e7f-b2e0-ffe743ce943f",
 *               "permission": "collaborator"
 *             }
 *           ]
 *         }
 *       ]
 *     }
 *   }
 * ]
 *
 */
router.get("/invitations", middlewares.isAccountAdmin, getInvitations);

/**
 *
 * @api {post} /:teamspace/invitations Create/Update invitation
 * @apiName createInvitation
 * @apiGroup Invitations
 * @apiDescription It creates or updates an invitation with the permissions  and a job assigned to the invited email
 *
 * @apiPermission teamSpaceAdmin
 *
 * @apiParam {String} teamspace Name of teamspace
 *
 * @apiBody {String} email The email to which the invitation will be sent
 * @apiBody {String} job An existing job for the teamspace
 * @apiBody {Permissions} permissions Valid permissions for the invited. If there is a teamspace_admin: true the rest of the permissions for that teamspace are ignored.
 *
 * @apiBody (Permissions) {Boolean} [teamspace_admin] Flag indicating if the invited user will become a teamspace administrator. If this flag is true the rest of the permissions are ignored.
 * @apiBody (Permissions) {ProjectPermissions[]} [projects] Permissions for projects and their models.
 *
 * @apiBody (ProjectPermissions) {String} project The id of the project in which the project permissions will be applied for the invited user.
 * @apiBody (ProjectPermissions) {Boolean} [project_admin] Flag indicating if the invited user will become a project administrator. If this flag is true the rest of the permissions are ignored.
 * @apiBody (ProjectPermissions) {ModelPermissions[]} [models] An array indicating the permissions for the models.
 *
 * @apiBody (ModelPermissions) {String} model The id of the model that will have the permission applied for the invited user.
 * @apiBody (ModelPermissions) {String} permission The type of permission applied for the invited user. Valid values are 'viewer', 'commenter' or 'collaborator'
 *
 * @apiExample {post} Example usage (with projects and models, permissions):
 * POST /teamSpace1/invitations HTTP/1.1
 *	{
 *		email:'invited@enterprise.com'
 *		job: 'jobA',
 *		permissions:{
 *			projects:[
 *				{
 *					project: '5bf7df65-f3a8-4337-8016-a63f00000000',
 *					models: [
 *						{ model: '5bfc11fa-50ac-b7e7-4328-83aa11fa50ac', permission:'viewer'},
 *						{ model: '00b1fb4d-091d-4f11-8dd6-9deaf71f5ca5', permission:'commenter'},
 *					]
 *				},
 *				{
 *					project: 'Bim Logo',
 *					project_admin: true
 *				}
 *			]
 *		}
 *	}
 *
 * @apiExample {post} Example usage (with teamspace admin):
 * POST /teamSpace1/invitations HTTP/1.1
 *	{
 *		email:'anotherinvited@enterprise.com'
 *		job: 'jobA',
 *		permissions: {
 *			teamspace_admin: true
 *		}
 *	}
 *
 * @apiSuccessExample {json} Success (with projects and models, permissions)
 * HTTP/1.1 200 OK
 *	{
 *		email:'invited@enterprise.com'
 *		job: 'jobA',
 *		permissions:{
 *			projects:[
 *				{
 *					project: '5bf7df65-f3a8-4337-8016-a63f00000000',
 *					models: [
 *						{ model: '5bfc11fa-50ac-b7e7-4328-83aa11fa50ac', permission:'viewer'},
 *						{ model: '00b1fb4d-091d-4f11-8dd6-9deaf71f5ca5', permission:'commenter'},
 *					]
 *				},
 *				{
 *					project: 'Bim Logo',
 *					project_admin: true
 *				}
 *			]
 *		}
 *	}
 *
 * @apiSuccessExample {json} Success (with teamspace admin)
 * HTTP/1.1 200 OK
 *	{
 *		email:'anotherinvited@enterprise.com'
 *		job: 'jobA',
 *		permissions: {
 *			teamspace_admin: true
 *		}
 *	}
 *
 */
router.post("/invitations", middlewares.canAddOrRemoveUsers, sendInvitation);

/**
 *
 * @api {delete} /:teamspace/invitations/:email Revokes an invitation
 * @apiName removeInvitation
 * @apiGroup Invitations
 * @apiDescription It revokes an invitation for a teamspace
 *
 * @apiPermission teamSpaceAdmin
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} email Email of the user invitation that you wish to revoke
 *
 * @apiExample {delete} Example usage:
 * DELETE /teamSpace1/invitations/invited@enterprise.com HTTP/1.1
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {}
 */
router.delete("/invitations/:email", middlewares.isAccountAdmin, removeInvitation);

function getInvitations(req, res, next) {
	Invitations.getInvitationsByTeamspace(req.params.account).then(invitations => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, invitations);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function sendInvitation(req, res, next) {
	const { account } = req.params;
	const { email, job, permissions } = req.body;
	const username = req.session.user.username;

	Invitations.create(email, account, job, username, permissions).then(invitation=> {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, invitation);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function removeInvitation(req, res, next) {
	const { account, email } = req.params;

	Invitations.removeTeamspaceFromInvitation(email, account, req.session.user.username).then(() => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, {email});
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}
module.exports = router;
