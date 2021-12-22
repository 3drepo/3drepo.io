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

const { HasReadAccessToLicense,
	hasReadAccessToSystemRoles,
	hasWriteAccessToLicense,
	hasWriteAccessToSystemRoles } = require('../../../utils/permissions/permissions');
const { getUserFromSession } = require('../../../utils/sessions');
const { respond } = require('../../../utils/responder');
const { templates } = require('../../../utils/responseCodes');

const AdminPerms = {};

AdminPerms.hasWriteAccessToSystemRoles = async (req, res, next) => {
	const { session } = req;
	const user = getUserFromSession(session);
	const hasAccess = await hasWriteAccessToSystemRoles(user);
	if (user && hasAccess) {
		next();
	} else if (!hasAccess) {
		respond(req, res, templates.notAuthorized);
	} else {
		respond(req, res, templates.userNotFound);
	}
};

AdminPerms.hasWriteAccessToLicense = async (req, res, next) => {
	const { session } = req;
	const user = getUserFromSession(session);
	const hasAccess = await hasWriteAccessToLicense(user);
	if (user && hasAccess) {
		next();
	} else if (!hasAccess) {
		respond(req, res, templates.notAuthorized);
	} else {
		respond(req, res, templates.userNotFound);
	}
};

AdminPerms.hasReadAccessToSystemRoles = async (req, res, next) => {
	const { session } = req;
	const user = getUserFromSession(session);
	const hasAccess = await hasReadAccessToSystemRoles(user);
	if (user && hasAccess) {
		next();
	} else if (!hasAccess) {
		respond(req, res, templates.notAuthorized);
	} else {
		respond(req, res, templates.userNotFound);
	}
};

AdminPerms.hasReadAccessToLicense = async (req, res, next) => {
	const { session } = req;
	const user = getUserFromSession(session);
	const hasAccess = await HasReadAccessToLicense(user);
	if (user && hasAccess) {
		next();
	} else if (!hasAccess) {
		respond(req, res, templates.notAuthorized);
	} else {
		respond(req, res, templates.userNotFound);
	}
};

module.exports = AdminPerms;
