/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const { createResponseCode, templates } = require('../../../../utils/responseCodes');
const { SUBSCRIPTION_TYPES } = require('../../../../models/teamspaces.constants');
const { getUserFromSession } = require('../../../../utils/sessions');
const { isTeamspaceAdmin } = require('../../../../utils/permissions');
const { isTeamspaceMember } = require('../../../../processors/teamspaces');
const { respond } = require('../../../../utils/responder');
const { validateSchema } = require('../../../../schemas/subscriptions');

const Teamspaces = {};

Teamspaces.canRemoveTeamspaceMember = async (req, res, next) => {
	try {
		const user = getUserFromSession(req.session);
		const { teamspace, username } = req.params;

		if (username === teamspace) {
			respond(req, res, createResponseCode(templates.notAuthorized, 'A user cannot be removed from their own teamspace.'));
			return;
		}

		if (username !== user && !await isTeamspaceAdmin(teamspace, user)) {
			respond(req, res, createResponseCode(templates.notAuthorized,
				'Admin permissions are required to remove another user from a teamspace.'));
			return;
		}

		// ensure the user to be removed has access to teamspace
		const userIsTsMember = await isTeamspaceMember(teamspace, username, true);
		if (!userIsTsMember) {
			throw createResponseCode(templates.notAuthorized,
				'The user to be removed is not a member of the teamspace.');
		}

		await next();
	} catch (err) {
		respond(req, res, err);
	}
};

Teamspaces.memberExists = async (req, res, next) => {
	const { params } = req;
	const { teamspace, member } = params;
	try {
		if (await isTeamspaceMember(teamspace, member, true)) {
			await next();
		} else {
			throw templates.userNotFound;
		}
	} catch (err) {
		respond(req, res, err);
	}
};

Teamspaces.validateUpdateQuota = async (req, res, next) => {
	try {
		req.body = await validateSchema(SUBSCRIPTION_TYPES.ENTERPRISE, req.body, true);
		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

module.exports = Teamspaces;
