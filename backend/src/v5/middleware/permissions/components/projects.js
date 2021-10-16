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

const { isProjectAdmin, isTeamspaceAdmin } = require('../../../utils/permissions/permissions');
const { getUserFromSession } = require('../../../utils/sessions');

const { respond } = require('../../../utils/responder');
const { templates } = require('../../../utils/responseCodes');

const Projects = {};

Projects.isProjectAdmin = async (req, res, next) => {
	const { session, params } = req;
	const user = getUserFromSession(session);
	const { teamspace, project } = params;

	const isTsAdmin = await isTeamspaceAdmin(teamspace, user);
	if (isTsAdmin) {
		next();
		return;
	}

	const isProjAdmin = await isProjectAdmin(teamspace, project, user);
	if (isProjAdmin) {
		next();
	} else {
		respond(req, res, templates.notAuthorized);
	}
};

module.exports = Projects;
