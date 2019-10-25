/**
 *	Copyright (C) 2018 3D Repo Ltd
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
 * @apiGroup Teamspace
 * @apiDescription It returns a list of invitations with their permissions and their jobs.
 *
 * @apiPermission teamSpaceMember
 *
 * @apiParam {String} teamspace Name of teamspace
 *
 * @apiExample {get} Example usage:
 * GET /teamSpace1/members HTTP/1.1
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 *
 */
router.get("/invitations", middlewares.isTeamspaceMember, getInvitations);

router.post("/invitations",  middlewares.isTeamspaceMember, sendInvitation);

router.delete("/invitations/:email", middlewares.isTeamspaceMember, removeInvitation);

function getInvitations(req, res, next) {
	Invitations.getInvitationsByTeamspace(req.params.account).then(invitations => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, {invitations});
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function sendInvitation(req, res, next) {
	const { account } = req.params;
	const { email, job, permissions } = req.body;

	Invitations.create(account, email, job, permissions).then(invitation=> {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, {invitation});
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function removeInvitation(req, res, next) {
	const { account, email } = req.params;

	Invitations.removeTeamspaceFromInvitation(email, account).then(() => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, {email});
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}
module.exports = router;
