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

const { getAccessibleJobs } = require('../../../../../models/jobs');
const { getMembers } = require('../../../../../models/modelSettings');
const { getProjectAdmins } = require('../../../../../models/projectSettings');
const { getTeamspaceAdmins } = require('../../../../../models/teamspaceSettings');

const Settings = {};

Settings.getMembers = async (teamspace, project, model, excludeViewers) => {
	const tsAdmins = await getTeamspaceAdmins(teamspace);
	const projectAdmins = await getProjectAdmins(teamspace, project);
	const modelMembers = await getMembers(teamspace, model, excludeViewers);
	return [...tsAdmins, ...projectAdmins, ...modelMembers];
};

Settings.getAccessibleJobs = async (teamspace, project, model, excludeViewers) => {
	const members = await Settings.getMembers(teamspace, project, model, excludeViewers);
	return getAccessibleJobs(teamspace, members);
};

module.exports = Settings;
