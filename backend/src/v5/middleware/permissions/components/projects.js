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

const { hasProjectAdminPermissions, isTeamspaceAdmin } = require('../../../utils/permissions/permissions');
const { getProjectById } = require('../../../models/projects');
const { getUserFromSession } = require('../../../utils/sessions');
const { respond } = require('../../../utils/responder');
const { templates } = require('../../../utils/responseCodes');

const ProjectPerms = {};

ProjectPerms.isProjectAdmin = async (req, res, next) => {
	const { session, params } = req;
	const user = getUserFromSession(session);
	const { teamspace, project } = params;

	const { permissions } = await getProjectById(teamspace, project, { permissions: 1 });

	const isTSAdmin = await isTeamspaceAdmin(teamspace, user);
	const isAdmin = isTSAdmin || hasProjectAdminPermissions(permissions, user);

	if (teamspace && project && user && isAdmin) {
		next();
	} else {
		respond(req, res, templates.notAuthorized);
	}
};

module.exports = ProjectPerms;
