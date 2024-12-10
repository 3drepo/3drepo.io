/**
 *  Copyright (C) 2024 3D Repo Ltd
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

const { getJobsByUsers } = require('../../../../../models/jobs');
const { getProjectAdmins } = require('../../../../../models/projectSettings');
const { getTeamspaceAdmins } = require('../../../../../models/teamspaceSettings');
const { getUsersWithPermissions } = require('../../../../../models/modelSettings');

const Settings = {};

Settings.getUsersWithPermissions = async (teamspace, project, model, excludeViewers) => {
	const [tsAdmins, projectAdmins, modelMembers] = await Promise.all([
		getTeamspaceAdmins(teamspace),
		getProjectAdmins(teamspace, project),
		getUsersWithPermissions(teamspace, model, excludeViewers),
	]);
	return [...tsAdmins, ...projectAdmins, ...modelMembers];
};

Settings.getJobsWithAccess = async (teamspace, project, model, excludeViewers) => {
	const users = await Settings.getUsersWithPermissions(teamspace, project, model, excludeViewers);
	return getJobsByUsers(teamspace, users);
};

module.exports = Settings;
