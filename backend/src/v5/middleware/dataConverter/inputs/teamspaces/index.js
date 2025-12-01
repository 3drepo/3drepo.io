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
const Yup = require('yup');
const { deleteIfUndefined } = require('../../../../utils/helper/objects');
const { getTeamspaceByAccount } = require('../../../../services/sso/frontegg/components/accounts');
const { getTeamspaceSetting } = require('../../../../models/teamspaceSettings');
const { getUserByEmail } = require('../../../../models/users');
const { getUserFromSession } = require('../../../../utils/sessions');
const { isTeamspaceAdmin } = require('../../../../utils/permissions');
const { isTeamspaceMember } = require('../../../../processors/teamspaces');
const { respond } = require('../../../../utils/responder');

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

Teamspaces.validateCreateTeamspaceData = async (req, res, next) => {
	const schema = Yup.object().shape({
		name: Yup.string()
			.matches(/^[a-zA-Z0-9]+$/, 'Teamspace name must be alphanumeric and contain no full stops.')
			.max(128, 'Teamspace name must be at most 128 characters long.')
			.required('Teamspace name is required'),
		admin: Yup.string().email('Admin must be a valid email address').optional(),
		accountId: Yup.string().optional(),
	});
	let teamspaceExists;

	try {
		req.body = deleteIfUndefined(await schema.validate(req.body, { stripUnknown: true }));

		try {
			teamspaceExists = await getTeamspaceSetting(req.body.name, { _id: 1 });
		} catch (e) {
			teamspaceExists = false;
		}

		if (teamspaceExists) {
			throw new Error('Teamspace with this name already exists.');
		}
		if (req.body.admin) await getUserByEmail(req.body.admin);

		if (req.body.accountId && !await getTeamspaceByAccount(req.body.accountId)) throw templates.teamspaceNotFound;

		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

module.exports = Teamspaces;
