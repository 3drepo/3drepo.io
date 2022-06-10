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
const { getUserByUsername } = require('../../../../models/users');
const { getUserFromSession } = require('../../../../utils/sessions');
const { isTeamspaceAdmin } = require('../../../../utils/permissions/permissions');
const { respond } = require('../../../../utils/responder');

const Teamspaces = {};

Teamspaces.canRemoveTeamspaceMember = async (req, res, next) => {
	try {
		const user = getUserFromSession(req.session);
		const { teamspace, username } = req.params;

		if (username === teamspace) {
			respond(req, res, createResponseCode(templates.invalidArguments, 'A user cannot be removed from its own teamspace.'));
			return;
		}

		const isTsAdmin = await isTeamspaceAdmin(teamspace, user);
		if (username !== user && !isTsAdmin) {
			respond(req, res, createResponseCode(templates.invalidArguments,
				'Admin permissions are required to remove another user from a teamspace.'));
			return;
		}

		// ensure the user exists
		await getUserByUsername(username);

		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

module.exports = Teamspaces;
