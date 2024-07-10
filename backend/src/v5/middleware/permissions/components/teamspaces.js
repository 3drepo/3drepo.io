/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const { createResponseCode, templates } = require('../../../utils/responseCodes');
const { hasAccessToTeamspace, isTeamspaceAdmin } = require('../../../utils/permissions/permissions');
const { getAddOns } = require('../../../models/teamspaceSettings');
const { getUserFromSession } = require('../../../utils/sessions');
const { respond } = require('../../../utils/responder');

const TeamspacePerms = {};

TeamspacePerms.isTeamspaceAdmin = async (req, res, next) => {
	const { session, params } = req;
	const user = getUserFromSession(session);
	const { teamspace } = params;

	try {
		const isAdmin = await isTeamspaceAdmin(teamspace, user);

		if (isAdmin) {
			next();
		} else {
			throw templates.notAuthorized;
		}
	} catch (err) {
		respond(req, res, err);
	}
};

TeamspacePerms.isTeamspaceMember = async (req, res, next) => {
	const { session, params } = req;
	const user = getUserFromSession(session);
	const { teamspace } = params;

	try {
		const hasAccess = await hasAccessToTeamspace(teamspace, user);
		if (teamspace && user && hasAccess) {
			await next();
		} else {
			throw templates.teamspaceNotFound;
		}
	} catch (err) {
		respond(req, res, err);
	}
};

TeamspacePerms.isModuleEnabled = (moduleName) => async (req, res, next) => {
	try {
		const addOns = await getAddOns(req.params.teamspace);
		if (addOns.modules && addOns.modules.includes(moduleName)) {
			await next();
		} else {
			respond(req, res, createResponseCode(templates.notAuthorized, `${moduleName} module is not enabled in this teamspace`));
		}
	} catch (err) {
		respond(req, res, err);
	}
};

module.exports = TeamspacePerms;
