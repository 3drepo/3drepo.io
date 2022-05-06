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

const Path = require('path');
const { v5Path } = require('../../../interop');

const { logger } = require(`${v5Path}/utils/logger`);

const { removeSubscription, getMembersInfo } = require(`${v5Path}/models/teamspaces`);
const { revokeTeamspaceRoleFromUser } = require(`${v5Path}/models/roles`);
const { getProjectList, deleteProject } = require(`${v5Path}/processors/teamspaces/projects`);

const removeAllProjects = async (teamspace) => {
	const projects = await getProjectList(teamspace, teamspace);
	return projects.map(({ _id }) => deleteProject(teamspace, _id));
};

const removeAllUsersFromTS = async (teamspace) => {
	const members = await getMembersInfo(teamspace);
	return Promise.all(
		members.map(({ user }) => ((user !== teamspace)
			? revokeTeamspaceRoleFromUser(teamspace, user) : Promise.resolve())),
	);
};

const run = async (teamspace) => {
	logger.logInfo(`Removing subscriptions, project datas and users from ${teamspace}...`);
	const opsProms = [
		removeSubscription(teamspace),
		removeAllProjects(teamspace),
		removeAllUsersFromTS(teamspace),
	];

	await Promise.all(opsProms);
	logger.logInfo('done.');
};

const genYargs = (yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('teamspace',
		{
			describe: 'teamspace to update',
			type: 'string',
			demandOption: true,
		});
	return yargs.command(commandName,
		'Remove Teamspace data, reset permissions and licenses',
		argsSpec,
		(argv) => run(argv.teamspace));
};

module.exports = {
	run,
	genYargs,
};
