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
const { getAddOns, getTeamspaceSetting, isAddOnModuleEnabled } = require('../../../models/teamspaceSettings');
const { hasAccessToTeamspace, isTeamspaceAdmin } = require('../../../utils/permissions');
const { getUserFromSession } = require('../../../utils/sessions');
const { respond } = require('../../../utils/responder');
const { ADD_ONS: { USERS_PROVISIONED } } = require('../../../models/teamspaces.constants');
const { BYPASS_AUTH } = require('../../../utils/config.constants');

const TeamspacePerms = {};

TeamspacePerms.isTeamspaceAdmin = async (req, res, next) => {
	try {
		const { session, params: { teamspace }, app } = req;

		if (!app.get(BYPASS_AUTH)) {
			const user = getUserFromSession(session);
			const isAdmin = await isTeamspaceAdmin(teamspace, user);
			if (!isAdmin) {
				throw templates.notAuthorized;
			}
		}
		await next();
	} catch (err) {
		respond(req, res, err);
	}
};

// bypassStatusCheck will not check if the status of the membership is active (i.e. could be
// pending invite, inactive etc). Used for checking if the user is associated with the teamspace at all
const checkTeamspaceMembership = (bypassStatusCheck) => async (req, res, next) => {
	try {
		const { session, params: { teamspace } } = req;
		if (req.app.get(BYPASS_AUTH)) {
			// if auth is bypassed, only check if teamspace exists.
			await getTeamspaceSetting(teamspace, { _id: 1 });
		} else {
			const user = getUserFromSession(session);
			const hasAccess = await hasAccessToTeamspace(teamspace, user, bypassStatusCheck);
			if (!(user && hasAccess)) {
				throw templates.teamspaceNotFound;
			}
		}
		await next();
	} catch (err) {
		respond(req, res, err);
	}
};

TeamspacePerms.isTeamspaceMember = checkTeamspaceMembership(true);

TeamspacePerms.isActiveTeamspaceMember = checkTeamspaceMembership(false);

TeamspacePerms.isAddOnModuleEnabled = (moduleName) => async (req, res, next) => {
	try {
		const addOnModuleEnabled = await isAddOnModuleEnabled(req.params.teamspace, moduleName);
		if (addOnModuleEnabled) {
			await next();
		} else {
			respond(req, res, createResponseCode(templates.moduleUnavailable, `${moduleName} module is not enabled in this teamspace`));
		}
	} catch (err) {
		respond(req, res, err);
	}
};

TeamspacePerms.notUserProvisioned = async (req, res, next) => {
	try {
		const { teamspace } = req.params;

		const addOns = await getAddOns(teamspace);
		if (addOns?.[USERS_PROVISIONED]) {
			respond(req, res, templates.userProvisioned);
			return;
		}

		await next();
	} catch (error) {
		respond(req, res, error);
	}
};

module.exports = TeamspacePerms;
